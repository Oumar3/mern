import express from 'express';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Upload a file
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: fileUrl,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Delete a file
router.delete('/:filename', auth, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join('./uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file
    fs.unlinkSync(filepath);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;