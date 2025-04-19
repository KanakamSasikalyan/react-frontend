const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/cloudinary/images', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.cloudinary.com/v1_1/dnl1vldmo/resources/search',
      {
        expression: 'folder:fashion_designs',
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from('852485781197181:W-WgxhZjQIj1n0OwJKVhRCQ8Yz8').toString('base64')}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch images from Cloudinary',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;