import { toast } from "sonner";

export const toastSuccess = (message: string) => {
  toast.success(message, {
    className:
      "bg-green-50 text-green-900 border-green-200 dark:bg-green-900/30 dark:text-green-100 dark:border-green-800",
  });
};

export const toastError = (message: string) => {
  toast.error(message, {
    className:
      "bg-red-50 text-red-900 border-red-200 dark:bg-red-900/30 dark:text-red-100 dark:border-red-800",
  });
};

export const toastInfo = (message: string) => {
  toast.message(message, {
    className:
      "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-800",
  });
};

