import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

/**
 * Route protection for authenticated users.
 * Redirects to login if not authenticated.
 */
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
