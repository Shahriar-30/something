import axios from "axios";
import { API_BASE_URL } from "../config/constants";

/**
 * Base API client configuration using Axios.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // If the error response has data, return that instead of just the message
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error.message || "Something went wrong");
  },
);

export { apiClient };
