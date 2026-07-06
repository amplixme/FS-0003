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