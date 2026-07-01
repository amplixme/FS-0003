const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../services/category.service');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    return success(res, categories, 200);
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id);
    return success(res, category, 200);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    const category = await createCategory({ name, slug });
    return success(res, category, 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await updateCategory(id, req.body);
    return success(res, category, 200);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteCategory(id);
    return success(res, { message: 'Categoría eliminada exitosamente' }, 200);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
