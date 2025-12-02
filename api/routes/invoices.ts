import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../utils/auth.js';

const router = express.Router();

// Get all invoices (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [invoices] = await pool.execute(`
      SELECT i.*, o.customer_name, o.customer_phone, o.customer_email, 
             o.total_amount, o.status as order_status
      FROM invoices i
      JOIN orders o ON i.order_id = o.id
      ORDER BY i.created_at DESC
    `);

    res.json({
      success: true,
      invoices: invoices || []
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single invoice
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    let query = `
      SELECT i.*, o.customer_name, o.customer_phone, o.customer_email, 
             o.total_amount, o.status as order_status, o.created_at as order_date
      FROM invoices i
      JOIN orders o ON i.order_id = o.id
      WHERE i.id = ?
    `;

    if (userRole === 'customer') {
      query += ' AND o.user_id = ?';
    }

    const [invoices] = await pool.execute(query, userRole === 'customer' ? [id, userId] : [id]);

    if (!Array.isArray(invoices) || invoices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const invoice = invoices[0];

    // Get order items
    const [items] = await pool.execute(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [(invoice as any).order_id]);

    res.json({
      success: true,
      invoice: {
        ...invoice,
        items: items || []
      }
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Generate invoice with WhatsApp link (admin only)
router.post('/generate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { order_id, customer_phone } = req.body;

    if (!order_id || !customer_phone) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and customer phone number are required'
      });
    }

    // Check if order exists
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [order_id]
    );

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0] as any;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Get order items for WhatsApp message
    const [items] = await pool.execute(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [order_id]);

    // Generate WhatsApp message
    const itemsList = (items as any[]).map(item => 
      `• ${item.product_name} x${item.quantity} - Rp ${item.price.toLocaleString()}`
    ).join('\n');

    const whatsappMessage = `Halo ${order.customer_name}! 👋\n\n` +
      `Terima kasih atas pesanan Anda di K-Pop Merchandise Store! 🎵✨\n\n` +
      `📋 *Detail Pesanan:*\n` +
      `No. Order: #${order_id}\n` +
      `Nama: ${order.customer_name}\n` +
      `Total: Rp ${order.total_amount.toLocaleString()}\n\n` +
      `📦 *Item Pesanan:*\n${itemsList}\n\n` +
      `Status: ${order.status.toUpperCase()}\n\n` +
      `💳 *Pembayaran:*\n` +
      `Silakan lakukan pembayaran ke rekening berikut:\n` +
      `BCA: 1234567890\n` +
      `Atas Nama: K-Pop Merchandise Store\n\n` +
      `Setelah pembayaran, silakan kirim bukti transfer ke nomor ini.\n\n` +
      `Terima kasih! 🙏\n\n` +
      `Best regards,\nK-Pop Merchandise Store 💜`;

    // Generate WhatsApp link
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappLink = `https://wa.me/${customer_phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;

    // Create invoice
    const [result] = await pool.execute(
      'INSERT INTO invoices (order_id, invoice_number, whatsapp_link) VALUES (?, ?, ?)',
      [order_id, invoiceNumber, whatsappLink]
    );

    const invoiceId = (result as any).insertId;

    const [invoices] = await pool.execute(`
      SELECT i.*, o.customer_name, o.customer_phone, o.customer_email, 
             o.total_amount, o.status as order_status
      FROM invoices i
      JOIN orders o ON i.order_id = o.id
      WHERE i.id = ?
    `, [invoiceId]);

    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      invoice: invoices[0],
      whatsapp_link: whatsappLink
    });

  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update invoice WhatsApp link (admin only)
router.put('/:id/whatsapp-link', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_phone } = req.body;

    if (!customer_phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer phone number is required'
      });
    }

    // Get invoice and order details
    const [invoices] = await pool.execute(`
      SELECT i.*, o.customer_name, o.total_amount, o.status as order_status
      FROM invoices i
      JOIN orders o ON i.order_id = o.id
      WHERE i.id = ?
    `, [id]);

    if (!Array.isArray(invoices) || invoices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const invoice = invoices[0] as any;

    // Generate new WhatsApp message
    const whatsappMessage = `Halo ${invoice.customer_name}! 👋\n\n` +
      `Terima kasih atas pesanan Anda di K-Pop Merchandise Store! 🎵✨\n\n` +
      `📋 *Detail Pesanan:*\n` +
      `No. Invoice: ${invoice.invoice_number}\n` +
      `Nama: ${invoice.customer_name}\n` +
      `Total: Rp ${invoice.total_amount.toLocaleString()}\n\n` +
      `Status: ${invoice.order_status.toUpperCase()}\n\n` +
      `💳 *Pembayaran:*\n` +
      `Silakan lakukan pembayaran ke rekening berikut:\n` +
      `BCA: 1234567890\n` +
      `Atas Nama: K-Pop Merchandise Store\n\n` +
      `Terima kasih! 🙏\n\n` +
      `Best regards,\nK-Pop Merchandise Store 💜`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappLink = `https://wa.me/${customer_phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;

    // Update invoice
    await pool.execute(
      'UPDATE invoices SET whatsapp_link = ? WHERE id = ?',
      [whatsappLink, id]
    );

    res.json({
      success: true,
      message: 'WhatsApp link updated successfully',
      whatsapp_link: whatsappLink
    });

  } catch (error) {
    console.error('Update WhatsApp link error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;