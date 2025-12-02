import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../utils/auth.js';

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { type, search } = req.query;
    let query = 'SELECT * FROM products';
    const params: any[] = [];

    if (type || search) {
      const conditions: string[] = [];
      
      if (type) {
        conditions.push('type = ?');
        params.push(type);
      }
      
      if (search) {
        conditions.push('(name LIKE ? OR description LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }
      
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const [products] = await pool.execute(query, params);

    res.json({
      success: true,
      products: products || []
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product: products[0]
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create product (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { name, description, price, type, stock, image_url } = req.body;

    if (!name || !price || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and type are required'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO products (name, description, price, type, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, type, stock || 0, image_url || null]
    );

    const productId = (result as any).insertId;

    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: products[0]
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, type, stock, image_url } = req.body;

    // Check if product exists
    const [existingProducts] = await pool.execute(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );

    if (!Array.isArray(existingProducts) || existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const [result] = await pool.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, type = ?, stock = ?, image_url = ? WHERE id = ?',
      [name, description, price, type, stock, image_url, id]
    );

    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: products[0]
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const [existingProducts] = await pool.execute(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );

    if (!Array.isArray(existingProducts) || existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await pool.execute(
      'DELETE FROM products WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;