const { Router } = require('express');
const authRoutes = require('./auth.routes');
const getRoutes = require('./get.routes');
const postRoutes = require('./post.routes');

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
router.use('/auth', authRoutes);

// Get Routes
router.use('/posts', getRoutes)

// Post routes
router.use('/posts', postRoutes);

module.exports = router;
