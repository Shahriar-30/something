import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import BusinessContextSync from "./components/BusinessContextSync";
import useAuthStore from "./store/useAuthStore";
import { PERMISSIONS } from "./lib/rbac";

// Lazy load pages for performance optimization
const Home = lazy(() => import("./pages/Home"));
const Contacts = lazy(() => import("./pages/Contacts"));
const DesignSystem = lazy(() => import("./pages/DesignSystem"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const Settings = lazy(() => import("./pages/Settings"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const BillingSettings = lazy(() => import("./pages/BillingSettings"));
const SupportSettings = lazy(() => import("./pages/SupportSettings"));
const BusinessSettings = lazy(() => import("./pages/BusinessSettings"));
const BusinessMembers = lazy(() => import("./pages/BusinessMembers"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
  </div>
);

/**
 * RootRedirect
 * Redirects authenticated users from / to their active business dashboard
 */
const RootRedirect = () => {
  const { isAuthenticated, activeBusiness } = useAuthStore();

  if (isAuthenticated && activeBusiness) {
    return <Navigate to={`/${activeBusiness.id}`} replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes - Accessible only when not logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route
          path="/auth/invite/accept/:token"
          element={<AcceptInvitation />}
        />

        {/* Protected Routes - Accessible only when logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<RootRedirect />} />

          <Route path="/:businessId" element={<BusinessContextSync />}>
            <Route element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="deals" element={<ComingSoon />} />
              <Route path="activities" element={<ComingSoon />} />
              <Route path="billing" element={<ComingSoon />} />
              <Route path="support" element={<ComingSoon />} />
              <Route path="reports" element={<ComingSoon />} />
              <Route path="settings" element={<Settings />}>
                <Route index element={<Navigate to="account" replace />} />
                <Route path="account" element={<AccountSettings />} />
                <Route
                  element={
                    <RoleProtectedRoute
                      allowedRoles={PERMISSIONS.VIEW_BUSINESS}
                    />
                  }
                >
                  <Route path="business" element={<BusinessSettings />} />
                </Route>
                <Route
                  element={
                    <RoleProtectedRoute
                      allowedRoles={PERMISSIONS.MANAGE_MEMBERS}
                    />
                  }
                >
                  <Route path="members" element={<BusinessMembers />} />
                </Route>
                <Route
                  element={
                    <RoleProtectedRoute
                      allowedRoles={PERMISSIONS.MANAGE_BILLING}
                    />
                  }
                >
                  <Route path="billing" element={<BillingSettings />} />
                </Route>
                <Route path="support" element={<SupportSettings />} />
              </Route>
              <Route path="design-system" element={<DesignSystem />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
