const { Router } = require('express');
const authRoutes = require('./auth.routes');
const postRoutes = require('./post.routes');
const commentRoutes = require('./comment.routes');
const uploadRoutes = require('./upload.routes');
const categoryRoutes = require('./category.routes');

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
router.use('/auth', authRoutes);

// Post routes
router.use('/posts', postRoutes);

// Comment routes
router.use('/posts', commentRoutes);
router.use('/comments', commentRoutes);

// Upload routes
router.use('/upload', uploadRoutes);

// Category routes
router.use('/categories', categoryRoutes);

module.exports = router;
