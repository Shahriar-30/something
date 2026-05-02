import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

/**
 * Route protection for unauthenticated users.
 * Redirects to home if already authenticated.
 */
const PublicRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
