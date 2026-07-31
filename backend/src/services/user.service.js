const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');

const getUserPublicProfile = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      _count: {
        select: {
          posts: {
            where: { published: true },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  return {
    id: user.id,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    postCount: user._count.posts,
  };
};

const updateOwnProfile = async (id, data) => {
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
    },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
    },
  });

  return user;
};

module.exports = { getUserPublicProfile, updateOwnProfile };
