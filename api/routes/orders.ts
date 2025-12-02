import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../utils/auth.js';

const router = express.Router();

// Get all orders (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT o.*, u.name as user_name, u.email as user_email,
             COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    res.json({
      success: true,
      orders: orders || []
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single order with items
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Get order details
    let orderQuery = `
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `;
    
    if (userRole === 'customer') {
      orderQuery += ' AND o.user_id = ?';
    }

    const [orders] = await pool.execute(orderQuery, userRole === 'customer' ? [id, userId] : [id]);

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Get order items
    const [items] = await pool.execute(`
      SELECT oi.*, p.name as product_name, p.image_url as product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);

    res.json({
      success: true,
      order: {
        ...order,
        items: items || []
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email, items, total_amount } = req.body;

    if (!customer_name || !customer_phone || !customer_email || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer information and items are required'
      });
    }

    // Validate items
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item data'
        });
      }
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Create order
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (customer_name, customer_phone, customer_email, total_amount) VALUES (?, ?, ?, ?)',
        [customer_name, customer_phone, customer_email, total_amount || 0]
      );

      const orderId = (orderResult as any).insertId;

      // Create order items
      for (const item of items) {
        // Get product price
        const [products] = await connection.execute(
          'SELECT price FROM products WHERE id = ?',
          [item.product_id]
        );

        if (!Array.isArray(products) || products.length === 0) {
          throw new Error(`Product ${item.product_id} not found`);
        }

        const product = products[0] as any;
        const itemPrice = product.price * item.quantity;

        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, itemPrice]
        );
      }

      await connection.commit();

      // Get created order
      const [orders] = await connection.execute(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      );

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: orders[0]
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update order status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'packing', 'shipped', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Check if order exists
    const [existingOrders] = await pool.execute(
      'SELECT id FROM orders WHERE id = ?',
      [id]
    );

    if (!Array.isArray(existingOrders) || existingOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: orders[0]
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user orders (customer only)
router.get('/user/my-orders', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    const [orders] = await pool.execute(`
      SELECT o.*, COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      orders: orders || []
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;