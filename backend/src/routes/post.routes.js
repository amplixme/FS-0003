const { Router } = require('express');
const { create, getById, getRelated } = require('../controllers/post.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { postSchema } = require('../middlewares/schemas');

const router = Router();

router.get('/:id', getById);
router.get('/:id/related', getRelated);
router.post('/', authMiddleware, validate(postSchema), create);

module.exports = router;
