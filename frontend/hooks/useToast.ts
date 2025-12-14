import { toast as sonnerToast } from 'sonner';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const showToast = (
    type: ToastType,
    message: string,
    options: ToastOptions = {}
  ) => {
    const { title, description, duration = 4000, action } = options;

    // Use plain configuration instead of JSX
    const toastConfig: any = {
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    };

    switch (type) {
      case 'success':
        sonnerToast.success(title || 'Success', {
          description: description || message,
          ...toastConfig,
        });
        break;
      case 'error':
        sonnerToast.error(title || 'Error', {
          description: description || message,
          ...toastConfig,
        });
        break;
      case 'warning':
        sonnerToast.warning(title || 'Warning', {
          description: description || message,
          ...toastConfig,
        });
        break;
      case 'info':
        sonnerToast.info(title || 'Information', {
          description: description || message,
          ...toastConfig,
        });
        break;
      default:
        sonnerToast(title || 'Notification', {
          description: description || message,
          ...toastConfig,
        });
        break;
    }
  };

  const success = (message: string, options?: ToastOptions) =>
    showToast('success', message, options);

  const error = (message: string, options?: ToastOptions) =>
    showToast('error', message, options);

  const warning = (message: string, options?: ToastOptions) =>
    showToast('warning', message, options);

  const info = (message: string, options?: ToastOptions) =>
    showToast('info', message, options);

  const loading = (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(options?.title || 'Loading', {
      description: options?.description || message,
      duration: options?.duration,
    });
  };

  const promise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...options,
    });
  };

  const dismiss = (id?: string | number) => {
    sonnerToast.dismiss(id);
  };

  return {
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss,
    toast: showToast,
  };
}