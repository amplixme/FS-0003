const { Router } = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { upload: uploadController } = require('../controllers/upload.controller');

const router = Router();

/**
 * @openapi
 * /upload:
 *   post:
 *     tags: [Upload]
 *     summary: Subir una imagen a Cloudinary
 *     description: Solo se aceptan JPG, PNG y WebP. Máximo 5 MB.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen (JPEG, PNG o WebP)
 *     responses:
 *       201:
 *         description: Imagen subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *                   example: https://res.cloudinary.com/.../image.jpg
 *       400:
 *         description: No se envió archivo o tipo no permitido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authMiddleware, upload.single('image'), uploadController);

module.exports = router;
