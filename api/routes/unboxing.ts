import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../utils/auth.js';
import { uploadSingle, handleUploadError } from '../utils/upload.js';

const router = express.Router();

// Get all unboxing photos (public)
router.get('/', async (req, res) => {
  try {
    const [photos] = await pool.execute(`
      SELECT up.*, u.name as user_name
      FROM unboxing_photos up
      JOIN users u ON up.user_id = u.id
      ORDER BY up.created_at DESC
    `);

    res.json({
      success: true,
      photos: photos || []
    });
  } catch (error) {
    console.error('Get unboxing photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload unboxing photo (admin only)
router.post('/upload', authenticateToken, requireAdmin, (req: any, res) => {
  uploadSingle(req, res, async (error) => {
    if (error) {
      return handleUploadError(error, res);
    }

    try {
      const userId = req.user.userId;
      const { caption } = req.body;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Image file is required'
        });
      }

      const imageUrl = `/uploads/unboxing/${req.file.filename}`;

      const [result] = await pool.execute(
        'INSERT INTO unboxing_photos (user_id, image_url, caption) VALUES (?, ?, ?)',
        [userId, imageUrl, caption || null]
      );

      const photoId = (result as any).insertId;

      const [photos] = await pool.execute(`
        SELECT up.*, u.name as user_name
        FROM unboxing_photos up
        JOIN users u ON up.user_id = u.id
        WHERE up.id = ?
      `, [photoId]);

      res.status(201).json({
        success: true,
        message: 'Unboxing photo uploaded successfully',
        photo: photos[0]
      });

    } catch (error) {
      console.error('Upload unboxing photo error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });
});

// Delete unboxing photo (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if photo exists
    const [existingPhotos] = await pool.execute(
      'SELECT id, image_url FROM unboxing_photos WHERE id = ?',
      [id]
    );

    if (!Array.isArray(existingPhotos) || existingPhotos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Unboxing photo not found'
      });
    }

    const photo = existingPhotos[0] as any;

    // Delete from database
    await pool.execute(
      'DELETE FROM unboxing_photos WHERE id = ?',
      [id]
    );

    // Delete file from filesystem (optional)
    try {
      const fs = await import('fs');
      const filePath = photo.image_url.startsWith('/uploads/') 
        ? photo.image_url.substring(1) 
        : photo.image_url;
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.warn('Could not delete file:', fileError);
    }

    res.json({
      success: true,
      message: 'Unboxing photo deleted successfully'
    });
  } catch (error) {
    console.error('Delete unboxing photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;