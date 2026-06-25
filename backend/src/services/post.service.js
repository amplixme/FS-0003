const prisma = require('../utils/prisma');

/**
 * Crea un nuevo post vinculado al usuario autenticado.
 * @param {{ title: string, content: string }} data
 * @param {number} authorId - ID del usuario (req.user.id)
 * @returns {object} Post creado con datos del autor
 */
const createPost = async ({ title, content }, authorId) => {
  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId,
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

/**
 * Obtiene un post por su ID con datos del autor.
 * @param {number} id
 * @returns {object|null} Post con autor o null si no existe
 */
const getPostById = async (id) => {
  const post = await prisma.post.findUnique({
    where: { id },
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

module.exports = { createPost, getPostById };
