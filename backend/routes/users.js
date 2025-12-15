const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Create or find user by phone number
router.post('/login', async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;

    if (!fullName || !phoneNumber) {
      return res.status(400).json({ error: 'Full name and phone number are required' });
    }

    // Try to find existing user
    let user = await User.findOne({ where: { phoneNumber } });

    if (user) {
      // Update name if different
      if (user.fullName !== fullName) {
        user.fullName = fullName;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        fullName,
        phoneNumber,
        debatesCount: 0,
        rating: 5.0
      });
    }

    const userData = {
      id: user.id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      bio: user.bio,
      topics: user.topics || [],
      profilePicture: user.profilePicture,
      stats: user.getStats()
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = {
      id: user.id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      bio: user.bio,
      topics: user.topics || [],
      profilePicture: user.profilePicture,
      stats: user.getStats()
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { bio, topics, fullName } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (bio !== undefined) user.bio = bio;
    if (topics !== undefined) user.topics = topics;
    if (fullName !== undefined) user.fullName = fullName;

    await user.save();

    const userData = {
      id: user.id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      bio: user.bio,
      topics: user.topics || [],
      profilePicture: user.profilePicture,
      stats: user.getStats()
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload profile picture
router.post('/:id/upload-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Save the file path (you might want to use a cloud storage service in production)
    const imageUrl = `/uploads/${req.file.filename}`;
    user.profilePicture = imageUrl;
    await user.save();

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: imageUrl
    });
  } catch (error) {
    console.error('Upload picture error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user stats (for after debates)
router.patch('/:id/stats', async (req, res) => {
  try {
    const { debatesCount, rating } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.updateStats(debatesCount, rating);

    res.json({
      message: 'Stats updated successfully',
      stats: user.getStats()
    });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;