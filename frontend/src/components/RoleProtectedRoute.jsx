import { Navigate, Outlet, useParams } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { hasPermission } from "../lib/rbac";

/**
 * Route protection based on user roles.
 * Redirects to the business dashboard if the user doesn't have required permissions.
 * 
 * @param {Object} props
 * @param {Array<string>} props.allowedRoles - List of roles that are allowed to access this route
 */
const RoleProtectedRoute = ({ allowedRoles }) => {
  const { activeBusiness } = useAuthStore();
  const { businessId } = useParams();
  
  const userRole = activeBusiness?.role;

  if (!hasPermission(userRole, allowedRoles)) {
    // If user doesn't have permission, redirect to their business home page
    return <Navigate to={`/${businessId}`} replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
