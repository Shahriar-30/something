import { apiClient } from "../../../api/client";

export const authService = {
  register: async (userData) => {
    return apiClient.post("/auth/register", userData);
  },

  verifyEmail: async (verificationData) => {
    return apiClient.post("/auth/verify-email", verificationData);
  },

  resendVerification: async (email) => {
    return apiClient.post("/auth/resend-verification", { email });
  },

  login: async (credentials) => {
    return apiClient.post("/auth/login", credentials);
  },

  logout: async () => {
    return apiClient.post("/auth/logout");
  },
};
