const { Router } = require('express');
const { getPublicProfile, updateMe } = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { updateProfileSchema } = require('../middlewares/schemas');

const router = Router();

router.put('/me', authMiddleware, validate(updateProfileSchema), updateMe);
router.get('/:id', getPublicProfile);

module.exports = router;
