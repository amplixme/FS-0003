const { Router } = require('express');
const { create, update, remove, getAll, getOne } = require('../controllers/post.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { postSchema, updatePostSchema } = require('../middlewares/schemas');

const router = Router();

/**
 * @openapi
 * /posts:
 *   get:
 *     tags: [Posts]
 *     summary: Obtener todos los posts publicados
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Slug de categoría para filtrar
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Posts por página
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, oldest, comments], default: newest }
 *         description: Ordenamiento
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Búsqueda por título y contenido
 *     responses:
 *       200:
 *         description: Lista paginada de posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedPosts'
 */
router.get('/', getAll);

/**
 * @openapi
 * /posts/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Obtener un post por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del post
 *     responses:
 *       200:
 *         description: Post encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getOne);

/**
 * @openapi
 * /posts:
 *   post:
 *     tags: [Posts]
 *     summary: Crear un nuevo post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: Mi nuevo post
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 10000
 *                 example: Contenido del post...
 *               published:
 *                 type: boolean
 *                 default: false
 *               coverImage:
 *                 type: string
 *                 format: uri
 *                 example: https://ejemplo.com/imagen.jpg
 *               categoryIds:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["uuid-categoria-1"]
 *     responses:
 *       201:
 *         description: Post creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authMiddleware, validate(postSchema), create);

/**
 * @openapi
 * /posts/{id}:
 *   put:
 *     tags: [Posts]
 *     summary: Actualizar un post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 10000
 *               coverImage:
 *                 type: string
 *                 format: uri
 *               categoryIds:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200:
 *         description: Post actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: No tienes permiso para modificar este post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authMiddleware, validate(updatePostSchema), update);

/**
 * @openapi
 * /posts/{id}:
 *   delete:
 *     tags: [Posts]
 *     summary: Eliminar un post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del post
 *     responses:
 *       200:
 *         description: Post eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: No tienes permiso para modificar este post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authMiddleware, remove);

module.exports = router;
