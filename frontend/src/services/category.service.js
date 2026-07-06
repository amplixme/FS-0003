import api from './api';

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error?.message ||
  error.response?.data?.message ||
  error.message ||
  fallback;

export const getAll = async () => {
  try {
    const response = await api.get('/categories');
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al obtener categorías'), { cause: error });
  }
};

export const create = async (data) => {
  try {
    const response = await api.post('/categories', data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al crear la categoría'), { cause: error });
  }
};

export const update = async (id, data) => {
  try {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al actualizar la categoría'), { cause: error });
  }
};

export const remove = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al eliminar la categoría'), { cause: error });
  }
};