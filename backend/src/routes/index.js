const { Router } = require('express');
const authRoutes = require('./auth.routes');
const postRoutes = require('./post.routes');

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
router.use('/auth', authRoutes);

// Post routes
router.use('/posts', postRoutes);

module.exports = router;
