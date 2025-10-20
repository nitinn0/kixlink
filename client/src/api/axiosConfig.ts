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

export default api;
