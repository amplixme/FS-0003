const { createComment, getCommentsByPost } = require('../services/comment.service');
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

const getByPost = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const comments = await getCommentsByPost(postId);
    return success(res, comments, 200);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getByPost };
