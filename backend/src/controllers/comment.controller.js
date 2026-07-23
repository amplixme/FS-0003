const {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} = require('../services/comment.service');
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

const update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { content } = req.body;
    const comment = await updateComment(id, { content }, req.user);
    return success(res, comment, 200);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await deleteComment(id, req.user);
    return success(res, { message: 'Comentario eliminado exitosamente' }, 200);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getByPost, update, remove };
