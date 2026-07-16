const { Router } = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const adminController = require('../controllers/admin.controller');

const router = Router();

// Todos los endpoints requieren auth + rol ADMIN
router.use(authMiddleware, requireRole('ADMIN'));

router.get('/stats', adminController.getStats);

router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:id/role', adminController.changeUserRole);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/posts', adminController.getRecentPosts);
router.delete('/posts/:id', adminController.deletePost);

router.get('/comments', adminController.getRecentComments);
router.delete('/comments/:id', adminController.deleteComment);

module.exports = router;