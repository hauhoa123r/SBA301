import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { App, AppProviders } from "@/app";
import "@/app/styles/global.css";
import { toastContainerConfig } from "@/shared/utils";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
    <ToastContainer {...toastContainerConfig} />
  </StrictMode>,
);
