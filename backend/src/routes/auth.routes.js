const { Router } = require('express');
const { login, register } = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate.middleware');
const { registerSchema } = require('../middlewares/schemas');

const router = Router();

router.post('/login', login);
router.post('/register', validate(registerSchema), register);

module.exports = router;