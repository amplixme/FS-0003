import api from './api';

const getErrorMessage = (error, fallback) => {
  const validationMessage = error.response?.data?.errors?.map((item) => item.message).join('. ');

  return error.response?.data?.error?.message
    || validationMessage
    || error.response?.data?.message
    || error.message
    || fallback;
};


export const getProfile = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al obtener el perfil'), { cause: error });
  }
};


export const updateProfile = async (data) => {
  try {
    const response = await api.put('/users/me', data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al actualizar el perfil'), { cause: error });
  }
};
