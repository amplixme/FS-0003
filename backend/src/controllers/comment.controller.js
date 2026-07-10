const { createComment } = require('../services/comment.service');
const { success } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const { content } = req.body;
    const authorId = req.user.id;

    const comment = await createComment({ content, postId, authorId });
    return success(res, comment, 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { create };
