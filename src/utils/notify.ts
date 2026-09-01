import { toast } from 'sonner';

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3500,
    });
  },
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 4500,
    });
  },
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 3500,
    });
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  },
  promise: toast.promise,
  dismiss: toast.dismiss,
};
