// ChatGPTs (doesn't know much about Svelte 5 yet) attempt to implement a Toast feature
interface ToastState {
  message: string;
  duration?: number;
}

let timeout: ReturnType<typeof setTimeout>;

export const toast = $state<{ value: ToastState | null }>({ value: null });

export function showToast(message: string, duration: number = 2000) {
  clearTimeout(timeout);

  toast.value = { message, duration };

  timeout = setTimeout(() => {
    toast.value = null;
  }, duration);
}
