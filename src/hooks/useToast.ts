import { useState } from 'react';

type ToastVariant = 'default' | 'success' | 'destructive';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToast() {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const showToast = (options: ToastOptions) => {
    console.log('Toast:', options);  // Placeholder for actual toast implementation
    setToast(options);
  };

  return { toast: showToast };
}