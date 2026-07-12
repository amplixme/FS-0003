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

const findCommentOrThrow = async (id) => {
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    throw new AppError('Comentario no encontrado', 404);
  }
  return comment;
};

const updateComment = async (id, data, user) => {
  const comment = await findCommentOrThrow(id);

  if (comment.authorId !== user.id) {
    throw new AppError('No autorizado', 403);
  }

  const updated = await prisma.comment.update({
    where: { id },
    data: { content: data.content },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return updated;
};

const deleteComment = async (id, user) => {
  const comment = await findCommentOrThrow(id);

  if (comment.authorId !== user.id && user.role !== 'ADMIN') {
    throw new AppError('No autorizado', 403);
  }

  await prisma.comment.delete({ where: { id } });
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

module.exports = { createComment, updateComment, deleteComment, getCommentsByPost };
