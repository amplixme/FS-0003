const { Router } = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { upload: uploadController } = require('../controllers/upload.controller');

const router = Router();

router.post('/', authMiddleware, upload.single('image'), uploadController);

module.exports = router;
