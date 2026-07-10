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

module.exports = { createComment };
