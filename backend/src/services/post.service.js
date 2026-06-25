const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');

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

const findPostOrThrow = async (id) => {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    throw new AppError('Post no encontrado', 404);
  }
  return post;
};

const checkOwnership = (post, user) => {
  if (post.authorId !== user.id && user.role !== 'ADMIN') {
    throw new AppError('No tienes permiso para modificar este post', 403);
  }
};

const updatePost = async (id, data, user) => {
  const post = await findPostOrThrow(id);
  checkOwnership(post, user);

  const updated = await prisma.post.update({
    where: { id },
    data,
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

  return updated;
};

const deletePost = async (id, user) => {
  const post = await findPostOrThrow(id);
  checkOwnership(post, user);

  await prisma.post.delete({ where: { id } });
};

module.exports = { createPost, getPostById, updatePost, deletePost };
