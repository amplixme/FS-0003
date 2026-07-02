const { Router } = require('express');
const { getAll, getOne, create, update, remove } = require('../controllers/category.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createCategorySchema, updateCategorySchema } = require('../middlewares/schemas');

const router = Router();

router.get('/', getAll);
router.get('/:id', getOne);

router.post('/', authMiddleware, requireRole('ADMIN'), validate(createCategorySchema), create);
router.put('/:id', authMiddleware, requireRole('ADMIN'), validate(updateCategorySchema), update);
router.delete('/:id', authMiddleware, requireRole('ADMIN'), remove);

module.exports = router;
