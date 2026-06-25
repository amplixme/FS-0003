const { Router } = require('express');
const { create, update, remove } = require('../controllers/post.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { postSchema, updatePostSchema } = require('../middlewares/schemas');

const router = Router();

router.post('/', authMiddleware, validate(postSchema), create);
router.put('/:id', authMiddleware, validate(updatePostSchema), update);
router.delete('/:id', authMiddleware, remove);

module.exports = router;
