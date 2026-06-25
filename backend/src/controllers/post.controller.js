const { createPost, getPostById } = require('../services/post.service');
const { success } = require('../utils/response');
const AppError = require('../utils/AppError');

/**
 * POST /api/posts
 * Crea un nuevo post vinculado al usuario autenticado.
 * El authorId se toma de req.user.id (NUNCA del body).
 */
const create = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const authorId = req.user.id;

    const post = await createPost({ title, content }, authorId);
    return success(res, post, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/posts/:id
 * Obtiene un post por su ID.
 */
const getById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const post = await getPostById(id);

    if (!post) {
      throw new AppError('Post no encontrado', 404);
    }

    return success(res, post, 200);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getById };
