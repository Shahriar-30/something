import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import useAppStore from "../../../store/useAppStore";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser, logout: storeLogout } = useAppStore();
  const navigate = useNavigate();

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      setLoading(false);
      return response;
    } catch (err) {
      setLoading(false);
      setError(err);
      throw err;
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      const { user, token } = response.data;

      // Store user and token
      setUser(user);
      localStorage.setItem("token", token);

      setLoading(false);
      return response;
    } catch (err) {
      setLoading(false);
      setError(err);
      throw err;
    }
  };

  const verifyEmail = async (verificationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.verifyEmail(verificationData);
      const { user, token } = response.data;

      // Store user and token
      setUser(user);
      localStorage.setItem("token", token);

      setLoading(false);
      return response;
    } catch (err) {
      setLoading(false);
      setError(err);
      throw err;
    }
  };

  const resendVerification = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.resendVerification(email);
      setLoading(false);
      return response;
    } catch (err) {
      setLoading(false);
      setError(err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      storeLogout();
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return {
    loading,
    error,
    register,
    login,
    verifyEmail,
    resendVerification,
    logout,
  };
};
