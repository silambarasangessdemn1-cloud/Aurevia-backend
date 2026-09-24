const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { upload } = require('../config/cloudinary');

router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image file is required' });
    }

    const imageUrls = req.files.map(file => file.path); // Cloudinary URLs

    const newBlog = new Blog({
      title,
      content,
      imageUrls
    });

    await newBlog.save();
    res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { title, content } = req.body;
    let updateData = { title, content };

    if (req.files && req.files.length > 0) {
      updateData.imageUrls = req.files.map(file => file.path);
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedBlog) return res.status(404).json({ error: 'Blog not found' });
    
    res.json({ message: 'Blog updated successfully', blog: updatedBlog });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

module.exports = router;
