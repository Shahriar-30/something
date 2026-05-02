import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/useAuthStore";
import authService from "../services/authService";

/**
 * Hook for authentication actions and state.
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const {
    setAuth,
    logout: clearAuth,
    setLoading,
    setError,
    isLoading,
    error,
  } = useAuthStore();

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setAuth(response.data);
      navigate("/");
      return response.data;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      // Registration successful, but email needs verification
      return response.data;
    } catch (err) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.verifyEmail(data);
      setAuth(response.data);
      navigate("/");
      return response.data;
    } catch (err) {
      setError(err.message || "Verification failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email) => {
    setLoading(true);
    try {
      await authService.resendVerification({ email });
    } catch (err) {
      setError(err.message || "Failed to resend verification");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  const requestPasswordReset = async (email) => {
    setLoading(true);
    setError(null);
    try {
      await authService.requestPasswordReset({ email });
    } catch (err) {
      setError(err.message || "Password reset request failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmPasswordReset = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await authService.confirmPasswordReset(data);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Password reset failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const switchBusiness = async (businessId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.switchBusiness(businessId);
      const { token, activeBusiness, businesses } = response.data;
      setAuth({
        user: useAuthStore.getState().user,
        token,
        activeBusiness,
        businesses,
      });
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to switch business");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    verifyEmail,
    resendVerification,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    switchBusiness,
    isLoading,
    error,
  };
};
