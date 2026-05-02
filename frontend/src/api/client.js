import axios from "axios";
import { API_BASE_URL } from "../config/constants";
import useAuthStore from "../store/useAuthStore";

/**
 * Base API client configuration using Axios.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Required for HttpOnly refresh token cookie
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // 1. If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        // The refresh token is in the HttpOnly cookie, but the backend also accepts it in the body
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const { token } = response.data.data;

        // Update store with new token
        useAuthStore.getState().updateToken(token);

        // Process queued requests
        processQueue(null, token);

        // Retry original request
        originalRequest.headers.Authorization = "Bearer " + token;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // If refresh fails, logout user
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // If the error response has data, return that instead of just the message
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ message: error.message || "Something went wrong" });
  },
);

export { apiClient };
