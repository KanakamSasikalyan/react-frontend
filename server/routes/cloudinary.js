const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/cloudinary/images', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.cloudinary.com/v1_1/dnl1vldmo/resources/image/fashion_designs',
      {
        headers: {
          Authorization: `Basic ${Buffer.from('852485781197181:W-WgxhZjQIj1n0OwJKVhRCQ8Yz8').toString('base64')}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    res.status(500).json({ error: 'Failed to fetch images from Cloudinary' });
  }
});

module.exports = router;