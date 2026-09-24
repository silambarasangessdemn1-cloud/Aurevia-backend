const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { upload } = require('../config/cloudinary');

router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image file is required' });
    }

    const imageUrls = req.files.map(file => file.path);

    const newService = new Service({
      title,
      description,
      imageUrls
    });

    await newService.save();
    res.status(201).json({ message: 'Service created successfully', service: newService });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { title, description } = req.body;
    let updateData = { title, description };

    if (req.files && req.files.length > 0) {
      updateData.imageUrls = req.files.map(file => file.path);
    }

    const updatedService = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedService) return res.status(404).json({ error: 'Service not found' });
    
    res.json({ message: 'Service updated successfully', service: updatedService });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

module.exports = router;
