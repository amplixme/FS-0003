const API_BASE = "/api";

const request = async (endpoint, options = {}) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error?.message || "Error del servidor");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

const apiClient = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) =>
    request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: (endpoint, body) =>
    request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};

export default apiClient;