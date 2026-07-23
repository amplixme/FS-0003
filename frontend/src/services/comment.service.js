import api from './api';

const getErrorMessage = (error, fallback) => {
  const validationMessage = error.response?.data?.errors?.map((item) => item.message).join('. ');
  return (
    error.response?.data?.error?.message ||
    validationMessage ||
    error.response?.data?.message ||
    error.message ||
    fallback
  );
};

export const getByPostId = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al obtener los comentarios'), { cause: error });
  }
};

export const create = async (postId, data) => {
  try {
    const response = await api.post(`/posts/${postId}/comments`, data);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al crear el comentario'), { cause: error });
  }
};

export const update = async (id, data) => {
  try {
    const response = await api.put(`/comments/${id}`, data);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al actualizar el comentario'), { cause: error });
  }
};

export const deleteComment = async (id) => {
  try {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al eliminar el comentario'), { cause: error });
  }
};

export { deleteComment as delete };
