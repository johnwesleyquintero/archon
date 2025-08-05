import { toast as sonnerToast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning" | "default";

interface ToastOptions {
  duration?: number;
}

const toast = (
  message: string,
  type: ToastType = "default",
  options?: ToastOptions,
) => {
  const toastFunctions = {
    success: sonnerToast.success,
    error: sonnerToast.error,
    info: sonnerToast.info,
    warning: sonnerToast.warning,
    default: sonnerToast,
  };

  const toastFunc = toastFunctions[type] || toastFunctions.default;
  toastFunc(message, {
    duration: options?.duration,
  });
};

export const useToast = () => {
  return {
    toast,
  };
};
