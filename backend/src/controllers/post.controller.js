const { createPost, updatePost, deletePost, getAllPosts, getPostById } = require('../services/post.service');
const { success } = require('../utils/response');
const AppError = require('../utils/AppError');


const getAll = async (req, res, next) => {
  try {
    const posts = await getAllPosts();
    return success(res, posts, 200);
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const post = await getPostById(id);

    if (!post) {
      throw new AppError('Post no encontrado', 404);
    }

    return success(res, post, 200);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { title, content, published, coverImage } = req.body;
    const authorId = req.user.id;

    const post = await createPost({ title, content, published, coverImage }, authorId);
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

module.exports = { create, update, remove, getAll, getOne };
