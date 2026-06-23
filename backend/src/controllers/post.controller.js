const { createPost, updatePost, deletePost } = require('../services/post.service');
const { success } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const authorId = req.user.id;

    const post = await createPost({ title, content }, authorId);
    return success(res, post, 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const post = await updatePost(id, req.body, req.user);
    return success(res, post, 200);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await deletePost(id, req.user);
    return success(res, { message: 'Post eliminado exitosamente' }, 200);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, update, remove };
