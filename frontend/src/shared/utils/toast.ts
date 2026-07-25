import { toast, type ToastContainerProps } from "react-toastify";

import { getApiErrorMessage } from "../api";

export { getApiErrorMessage } from "../api";

interface ToastClassConfig {
  bodyClassName: string;
  progressClassName: string;
  toastClassName: string;
}

export const toastContainerConfig = {
  position: "top-right",
  autoClose: 3500,
  newestOnTop: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  className: "edu-toast-container",
  toastClassName: "edu-toast",
  bodyClassName: "edu-toast-body",
  progressClassName: "edu-toast-progress",
} satisfies ToastContainerProps & ToastClassConfig;

export const showSuccessToast = (message: string): void => {
  toast.success(message);
};

export const showErrorToast = (message: string): void => {
  toast.error(message);
};

export const showApiErrorToast = (
  error: unknown,
  fallbackMessage?: string,
): void => {
  toast.error(getApiErrorMessage(error, fallbackMessage));
};
