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

// ✅ In-flight request deduplication
const inFlightRequests = new Map();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Create a unique key for this request
  const requestKey = `${config.method}:${config.url}`;
  
  // If there's already a pending request with the same method+URL, reuse it
  if (inFlightRequests.has(requestKey)) {
    const controller = inFlightRequests.get(requestKey);
    config.signal = controller.signal;
  } else {
    // Create new AbortController for this request
    const controller = new AbortController();
    config.signal = controller.signal;
    inFlightRequests.set(requestKey, controller);
  }

  return config;
});

// ✅ Response handling
api.interceptors.response.use(
  (response) => {
    // Clear from in-flight map when request completes
    const requestKey = `${response.config.method}:${response.config.url}`;
    inFlightRequests.delete(requestKey);
    return response;
  },
  (error) => {
    // Clear from in-flight map when request fails
    if (error.config) {
      const requestKey = `${error.config.method}:${error.config.url}`;
      inFlightRequests.delete(requestKey);
    }

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
