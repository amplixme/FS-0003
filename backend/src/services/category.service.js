const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');

const getAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
};

const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  if (!category) {
    throw new AppError('Categoría no encontrada', 404);
  }

  return category;
};

const createCategory = async ({ name, slug }) => {
  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name }, { slug }],
    },
  });

  if (existing) {
    throw new AppError('Ya existe una categoría con ese nombre o slug', 409);
  }

  return prisma.category.create({
    data: { name, slug },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
};

const updateCategory = async (id, data) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new AppError('Categoría no encontrada', 404);
  }

  if (data.name || data.slug) {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          ...(data.name ? [{ name: data.name }] : []),
          ...(data.slug ? [{ slug: data.slug }] : []),
        ],
        NOT: { id },
      },
    });

    if (existing) {
      throw new AppError('Ya existe otra categoría con ese nombre o slug', 409);
    }
  }

  return prisma.category.update({
    where: { id },
    data,
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
};

const deleteCategory = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  if (!category) {
    throw new AppError('Categoría no encontrada', 404);
  }

  if (category._count.posts > 0) {
    throw new AppError('No se puede eliminar una categoría con posts asociados', 409);
  }

  await prisma.category.delete({ where: { id } });
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
