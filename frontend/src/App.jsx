import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

// Lazy load pages for performance optimization
const Home = lazy(() => import("./pages/Home"));
const Contacts = lazy(() => import("./pages/Contacts"));
const DesignSystem = lazy(() => import("./pages/DesignSystem"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const Settings = lazy(() => import("./pages/Settings"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/deals" element={<ComingSoon />} />
          <Route path="/activities" element={<ComingSoon />} />
          <Route path="/billing" element={<ComingSoon />} />
          <Route path="/support" element={<ComingSoon />} />
          <Route path="/reports" element={<ComingSoon />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/design-system" element={<DesignSystem />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
