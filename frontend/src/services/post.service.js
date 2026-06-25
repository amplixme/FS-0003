import api from './api';


export const getAll = async () => {
  try {
    const response = await api.get('/posts');
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error al obtener posts', { cause: error });
  }
};


export const getPosts = getAll;


export const getPostById = async (id) => {
  try {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error al obtener el post', { cause: error });
  }
};


export const createPost = async (data) => {
  try {
    const response = await api.post('/posts', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error al crear el post', { cause: error });
  }
};


export const updatePost = async (id, data) => {
  try {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error al actualizar el post', { cause: error });
  }
};


export const deletePost = async (id) => {
  try {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error al eliminar el post', { cause: error });
  }
};
