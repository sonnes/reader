import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "@/App";
import "./index.css";
import type { AppState } from "@/types";

// Extend Window interface for initial data
declare global {
  interface Window {
    __INITIAL_DATA__?: AppState;
  }
}

const container = document.getElementById("root")!;
const initialData = window.__INITIAL_DATA__;

// Use hydration if we have initial data from SSR, otherwise create fresh root
if (initialData) {
  hydrateRoot(
    container,
    <StrictMode>
      <App initialData={initialData} />
    </StrictMode>
  );
} else {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
