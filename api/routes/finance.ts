import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../utils/auth.js';

const router = express.Router();

// Get all financial records (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, start_date, end_date } = req.query;
    let query = 'SELECT * FROM finance_records';
    const params: any[] = [];

    if (type || start_date || end_date) {
      const conditions: string[] = [];
      
      if (type) {
        conditions.push('type = ?');
        params.push(type);
      }
      
      if (start_date) {
        conditions.push('created_at >= ?');
        params.push(start_date);
      }
      
      if (end_date) {
        conditions.push('created_at <= ?');
        params.push(end_date);
      }
      
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const [records] = await pool.execute(query, params);

    // Calculate totals
    const [incomeResult] = await pool.execute(
      'SELECT SUM(amount) as total FROM finance_records WHERE type = "income"'
    );
    const [expenseResult] = await pool.execute(
      'SELECT SUM(amount) as total FROM finance_records WHERE type = "expense"'
    );

    const totalIncome = (incomeResult as any)[0]?.total || 0;
    const totalExpense = (expenseResult as any)[0]?.total || 0;
    const profit = totalIncome - totalExpense;

    res.json({
      success: true,
      records: records || [],
      summary: {
        total_income: totalIncome,
        total_expense: totalExpense,
        profit: profit
      }
    });
  } catch (error) {
    console.error('Get finance records error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create financial record (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { type, description, amount } = req.body;
    const userId = req.user.userId;

    if (!type || !amount || !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type (income/expense) and amount are required'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO finance_records (user_id, type, description, amount) VALUES (?, ?, ?, ?)',
      [userId, type, description || null, amount]
    );

    const recordId = (result as any).insertId;

    const [records] = await pool.execute(
      'SELECT * FROM finance_records WHERE id = ?',
      [recordId]
    );

    res.status(201).json({
      success: true,
      message: 'Financial record created successfully',
      record: records[0]
    });
  } catch (error) {
    console.error('Create finance record error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get financial summary (admin only)
router.get('/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = 'SELECT type, SUM(amount) as total FROM finance_records';
    const params: any[] = [];

    if (start_date || end_date) {
      const conditions: string[] = [];
      
      if (start_date) {
        conditions.push('created_at >= ?');
        params.push(start_date);
      }
      
      if (end_date) {
        conditions.push('created_at <= ?');
        params.push(end_date);
      }
      
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY type';

    const [results] = await pool.execute(query, params);

    let totalIncome = 0;
    let totalExpense = 0;

    (results as any[]).forEach((row: any) => {
      if (row.type === 'income') {
        totalIncome = row.total;
      } else if (row.type === 'expense') {
        totalExpense = row.total;
      }
    });

    res.json({
      success: true,
      summary: {
        total_income: totalIncome,
        total_expense: totalExpense,
        profit: totalIncome - totalExpense,
        profit_margin: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Get finance summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete financial record (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if record exists
    const [existingRecords] = await pool.execute(
      'SELECT id FROM finance_records WHERE id = ?',
      [id]
    );

    if (!Array.isArray(existingRecords) || existingRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Financial record not found'
      });
    }

    await pool.execute(
      'DELETE FROM finance_records WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Financial record deleted successfully'
    });
  } catch (error) {
    console.error('Delete finance record error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;