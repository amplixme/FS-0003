const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');

const getAllPosts = async (categorySlug) => {
  const where = { published: true };

  if (categorySlug) {
    where.categories = { some: { slug: categorySlug } };
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      categories: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return posts;
};

const getPostById = async (id) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      categories: true,
    },
  });

  return post;
};

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

module.exports = { createPost, updatePost, deletePost, getAllPosts, getPostById };
