const adminService = require('../services/admin.service');

const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await adminService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

const changeUserRole = async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id);
    const requesterId = req.user.id;
    const updated = await adminService.changeUserRole(targetId, requesterId);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id);
    const updated = await adminService.updateUser(targetId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id);
    const requesterId = req.user.id;
    const result = await adminService.deleteUser(targetId, requesterId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const result = await adminService.deletePost(postId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const commentId = parseInt(req.params.id);
    const result = await adminService.deleteComment(commentId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getRecentPosts = async (req, res, next) => {
  try {
    const posts = await adminService.getRecentPosts();
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

const getRecentComments = async (req, res, next) => {
  try {
    const comments = await adminService.getRecentComments();
    res.json(comments);
  } catch (err) {
    next(err);
  }
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