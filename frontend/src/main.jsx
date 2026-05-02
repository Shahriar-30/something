import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { ThemeProvider } from "./providers/ThemeProvider";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
