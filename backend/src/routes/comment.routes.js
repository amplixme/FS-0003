const { Router } = require('express');
const { create, update, remove } = require('../controllers/comment.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createCommentSchema, updateCommentSchema } = require('../middlewares/schemas');

const router = Router();

router.post('/:postId/comments', authMiddleware, validate(createCommentSchema), create);
router.put('/:id', authMiddleware, validate(updateCommentSchema), update);
router.delete('/:id', authMiddleware, remove);

module.exports = router;
