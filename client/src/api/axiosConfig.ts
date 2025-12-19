import axios from "axios";

const getBackendUrl = () => {
  const currentHost = window.location.hostname;

  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:4000';
  }

  return `http://${currentHost}:4000`;
};

const api = axios.create({
  baseURL: getBackendUrl(),
});

// ✅ Automatically attach token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle token expiration or unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      // Clear user session
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("username");
      localStorage.removeItem("name");
      localStorage.removeItem("is_admin");

      // Redirect to login
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
