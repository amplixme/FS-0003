const prisma = require('../utils/prisma');

/**
 * Crea un nuevo post vinculado al usuario autenticado.
 * @param {{ title: string, content: string, published?: boolean }} data
 * @param {number} authorId - ID del usuario (req.user.id)
 * @returns {object} Post creado con datos del autor
 */
const createPost = async ({ title, content, published }, authorId) => {
  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId,
      ...(typeof published === 'boolean' ? { published } : {}),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return post;
};

module.exports = { createPost };
