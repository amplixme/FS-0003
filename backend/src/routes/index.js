const { Router } = require('express');
const authRoutes = require('./auth.routes');
const postRoutes = require('./post.routes');
const commentRoutes = require('./comment.routes');
const userRoutes = require('./user.routes');
const uploadRoutes = require('./upload.routes');
const categoryRoutes = require('./category.routes');
const adminRoutes = require('./admin.routes');

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

// User routes
router.use('/users', userRoutes);

// Upload routes
router.use('/upload', uploadRoutes);

// Category routes
router.use('/categories', categoryRoutes);

// Admin routes
router.use('/admin', adminRoutes);

module.exports = router;
