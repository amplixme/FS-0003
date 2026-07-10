const { Router } = require('express');
const { create, getByPost } = require('../controllers/comment.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createCommentSchema } = require('../middlewares/schemas');

const router = Router();

router.get('/:postId/comments', getByPost);
router.post('/:postId/comments', authMiddleware, validate(createCommentSchema), create);

module.exports = router;
