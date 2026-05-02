import { apiClient } from "../../../api/client";

/**
 * Authentication service for handling all auth-related API calls.
 */
const authService = {
  /**
   * Register a new user and business
   * @param {Object} data - { name, email, password, businessName }
   */
  register: (data) => apiClient.post("/auth/register", data),

  /**
   * Login user
   * @param {Object} data - { email, password }
   */
  login: (data) => apiClient.post("/auth/login", data),

  /**
   * Verify email with 6-digit code
   * @param {Object} data - { email, code }
   */
  verifyEmail: (data) => apiClient.post("/auth/verify-email", data),

  /**
   * Resend verification email
   * @param {Object} data - { email }
   */
  resendVerification: (data) => apiClient.post("/auth/resend-verification", data),

  /**
   * Request password reset code
   * @param {Object} data - { email }
   */
  requestPasswordReset: (data) =>
    apiClient.post("/auth/password-reset/request", data),

  /**
   * Confirm password reset with code
   * @param {Object} data - { email, code, password }
   */
  confirmPasswordReset: (data) =>
    apiClient.post("/auth/password-reset/confirm", data),

  /**
   * Switch active business context
   * @param {string} businessId
   */
  switchBusiness: (businessId) =>
    apiClient.post(`/auth/switch-business/${businessId}`),

  /**
   * Refresh access token manually (if needed)
   */
  refresh: () => apiClient.post("/auth/refresh"),

  /**
   * Logout user and clear session
   */
  logout: () => apiClient.post("/auth/logout"),
};

export default authService;
