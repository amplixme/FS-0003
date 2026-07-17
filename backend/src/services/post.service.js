const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');

const getAllPosts = async ({ categorySlug, page = 1, limit = 10, sort = 'newest', authorId } = {}) => {
  const where = {
    published: true,

    ...(categorySlug && {
      categories: {
        some: {
          slug: categorySlug,
        },
      },
    }),

    ...(authorId && { authorId: Number(authorId) }),
  };

  const orderByMap = {
    newest: { createdAt: 'desc' },
    oldest: { createdAt: 'asc' },
    comments: { comments: { _count: 'desc' } },
  };

  const orderBy = orderByMap[sort] || orderByMap.newest;

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts.map(({ _count, ...post }) => ({
      ...post,
      commentCount: _count.comments,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
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

const createPost = async ({ title, content, published, coverImage, categoryIds }, authorId) => {
  const post = await prisma.post.create({
    data: {
      title,
      content,
      coverImage: coverImage || null,
      authorId,
      ...(typeof published === 'boolean' ? { published } : {}),
      ...(Array.isArray(categoryIds) ? { categories: { connect: categoryIds.map((id) => ({ id })) } } : {}),
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
  const { categoryIds, ...postData } = data;

  const updated = await prisma.post.update({
    where: { id },
    data: {
      ...postData,
      ...(Array.isArray(categoryIds) ? { categories: { set: categoryIds.map((categoryId) => ({ id: categoryId })) } } : {}),
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

  return updated;
};

const deletePost = async (id, user) => {
  const post = await findPostOrThrow(id);
  checkOwnership(post, user);

  await prisma.post.delete({ where: { id } });
};

module.exports = { createPost, updatePost, deletePost, getAllPosts, getPostById };
