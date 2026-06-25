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

/**
 * Obtiene una lista de posts relacionados (excluyendo el actual).
 * @param {number} excludeId - ID del post a excluir
 * @param {number} [limit=3] - Cantidad máxima de resultados
 * @returns {Array} Lista de posts
 */
const getRelatedPosts = async (excludeId, limit = 3) => {
  const posts = await prisma.post.findMany({
    where: {
      id: { not: excludeId },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return posts;
};

module.exports = { createPost, getPostById, getRelatedPosts };
