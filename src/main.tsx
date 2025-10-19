import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { DeviceProvider } from "./contexts/device-context";
import { ThemeProvider } from "./contexts/theme-context.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DeviceProvider>
        <App />
      </DeviceProvider>
    </ThemeProvider>
  </StrictMode>
);
