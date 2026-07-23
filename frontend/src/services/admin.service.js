import apiClient from './apiClient';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const adminService = {
  getStats: () => apiClient.get('/admin/stats', { headers: authHeaders() }),

  getUsers: () => apiClient.get('/admin/users', { headers: authHeaders() }),

  createUser: (data) => apiClient.post('/admin/users', data, { headers: authHeaders() }),

  changeUserRole: (id) =>
    apiClient.patch(`/admin/users/${id}/role`, {}, { headers: authHeaders() }),

  updateUser: (id, data) => apiClient.patch(`/admin/users/${id}`, data, { headers: authHeaders() }),

  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`, { headers: authHeaders() }),

  getPosts: () => apiClient.get('/admin/posts', { headers: authHeaders() }),

  deletePost: (id) => apiClient.delete(`/admin/posts/${id}`, { headers: authHeaders() }),

  getComments: () => apiClient.get('/admin/comments', { headers: authHeaders() }),

  deleteComment: (id) => apiClient.delete(`/admin/comments/${id}`, { headers: authHeaders() }),
};

export default adminService;
