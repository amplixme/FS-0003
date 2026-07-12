const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');

const createComment = async ({ content, postId, authorId }) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!post) {
    throw new AppError('Post no encontrado', 404);
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      authorId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return comment;
};

const getCommentsByPost = async (postId) => {
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return comments;
};

module.exports = { createComment, getCommentsByPost };
