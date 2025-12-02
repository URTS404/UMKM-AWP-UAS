import express from 'express';
import { pool } from '../config/database.js';
import { generateToken, hashPassword, comparePassword } from '../utils/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, passwordHash, name, 'customer']
    );

    const userId = (result as any).insertId;

    // Generate JWT token
    const token = generateToken({
      userId,
      email,
      role: 'customer'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        name,
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT id, email, password_hash, name, role FROM users WHERE email = ?',
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0] as any;

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/profile', async (req: any, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await pool.execute(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;