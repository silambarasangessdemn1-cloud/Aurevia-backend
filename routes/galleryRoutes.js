const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { upload } = require('../config/cloudinary');

router.post('/', upload.array('images', 20), async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image file is required' });
    }

    const newItems = req.files.map(file => ({
      title: title || 'Gallery Image', // Fallback title
      imageUrl: file.path
    }));

    const createdItems = await Gallery.insertMany(newItems);
    res.status(201).json({ message: 'Gallery items created successfully', items: createdItems });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(500).json({ error: 'Failed to create gallery item' });
  }
});

router.get('/', async (req, res) => {
  try {
    const galleryItems = await Gallery.find().sort({ createdAt: -1 });
    res.json(galleryItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;
