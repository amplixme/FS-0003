const { createPost } = require('../services/post.service');
const { success } = require('../utils/response');

/**
 * POST /api/posts
 * Crea un nuevo post vinculado al usuario autenticado.
 * El authorId se toma de req.user.id (NUNCA del body).
 */
const create = async (req, res, next) => {
  try {
    const { title, content, published } = req.body;
    const authorId = req.user.id;

    const post = await createPost({ title, content, published }, authorId);
    return success(res, post, 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { create };
