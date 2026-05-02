import { useEffect, useState } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { useAuth } from "../features/auth/hooks/useAuth";

/**
 * BusinessContextSync
 * Synchronizes the application context (JWT token) with the businessId in the URL.
 * If the URL businessId changes, it triggers a switchBusiness call.
 */
const BusinessContextSync = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { activeBusiness, businesses, isAuthenticated } = useAuthStore();
  const { switchBusiness } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !businessId) return;

    if (activeBusiness && activeBusiness.id !== businessId) {
      const hasAccess = businesses.some((b) => b.id === businessId);

      if (hasAccess) {
        const performSwitch = async () => {
          setIsSyncing(true);
          try {
            await switchBusiness(businessId);
          } catch (err) {
            console.error("Failed to sync business context from URL", err);
            navigate(`/${activeBusiness.id}`, { replace: true });
          } finally {
            setIsSyncing(false);
          }
        };
        performSwitch();
      } else {
        console.warn("Access denied to business in URL, redirecting...");
        navigate(`/${activeBusiness.id}`, { replace: true });
      }
    }
  }, [
    businessId,
    activeBusiness,
    businesses,
    isAuthenticated,
    switchBusiness,
    navigate,
  ]);

  if (isSyncing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Switching workspace...
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default BusinessContextSync;
