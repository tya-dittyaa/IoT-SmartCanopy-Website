import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./contexts/theme-context.tsx";
import { WsProvider } from "./contexts/ws-context";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <WsProvider>
        <App />
      </WsProvider>
    </ThemeProvider>
  </StrictMode>
);
