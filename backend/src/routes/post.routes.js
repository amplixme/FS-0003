const { Router } = require('express');
const { create } = require('../controllers/post.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { postSchema } = require('../middlewares/schemas');

const router = Router();

router.post('/', authMiddleware, validate(postSchema), create);

module.exports = router;
