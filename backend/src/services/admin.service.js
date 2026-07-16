const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const getStats = async () => {
  const [totalUsers, totalPosts, totalComments, postsByCategory] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.category.findMany({
      select: {
        name: true,
        _count: { select: { posts: true } },
      },
    }),
  ]);

  return {
    totalUsers,
    totalPosts,
    totalComments,
    postsByCategory: postsByCategory.map((c) => ({
      category: c.name,
      count: c._count.posts,
    })),
  };
};

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { posts: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    postCount: u._count.posts,
  }));
};

const createUser = async ({ name, email, password, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('El email ya está registrado');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { name, email, password: hashed, role: role || 'USER' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
};

const changeUserRole = async (targetId, requesterId) => {
  if (targetId === requesterId) {
    const err = new Error('No puedes cambiar tu propio rol');
    err.status = 403;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }

  const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
  return prisma.user.update({
    where: { id: targetId },
    data: { role: newRole },
    select: { id: true, name: true, email: true, role: true },
  });
};

const updateUser = async (targetId, data) => {
  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }

  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.role) updateData.role = data.role;

  return prisma.user.update({
    where: { id: targetId },
    data: updateData,
    select: { id: true, name: true, email: true, role: true },
  });
};

const deleteUser = async (targetId, requesterId) => {
  if (targetId === requesterId) {
    const err = new Error('No puedes eliminarte a ti mismo');
    err.status = 403;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }

  // Eliminar comentarios del usuario
  await prisma.comment.deleteMany({ where: { authorId: targetId } });

  // Eliminar comentarios en los posts del usuario
  const userPosts = await prisma.post.findMany({
    where: { authorId: targetId },
    select: { id: true },
  });
  const postIds = userPosts.map((p) => p.id);
  if (postIds.length > 0) {
    await prisma.comment.deleteMany({ where: { postId: { in: postIds } } });
  }

  // Eliminar posts del usuario
  await prisma.post.deleteMany({ where: { authorId: targetId } });

  // Eliminar usuario
  await prisma.user.delete({ where: { id: targetId } });

  return { message: 'Usuario eliminado correctamente' };
};

const deletePost = async (postId) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    const err = new Error('Post no encontrado');
    err.status = 404;
    throw err;
  }

  await prisma.comment.deleteMany({ where: { postId } });
  await prisma.post.delete({ where: { id: postId } });
  return { message: 'Post eliminado correctamente' };
};

const deleteComment = async (commentId) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    const err = new Error('Comentario no encontrado');
    err.status = 404;
    throw err;
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return { message: 'Comentario eliminado correctamente' };
};

const getRecentPosts = async () => {
  return prisma.post.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      published: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
      categories: { select: { id: true, name: true } },
    },
  });
};

const getRecentComments = async () => {
  return prisma.comment.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
      post: { select: { id: true, title: true } },
    },
  });
};

module.exports = {
  getStats,
  getAllUsers,
  createUser,
  changeUserRole,
  updateUser,
  deleteUser,
  deletePost,
  deleteComment,
  getRecentPosts,
  getRecentComments,
};