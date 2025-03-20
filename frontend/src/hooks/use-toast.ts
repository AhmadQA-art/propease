import { useState } from 'react';
import toast from 'react-hot-toast';

type ToastVariant = 'default' | 'destructive';

interface ToastProps {
  title: string;
  description: string;
  variant?: ToastVariant;
}

export const useToast = () => {
  const showToast = ({ title, description, variant = 'default' }: ToastProps) => {
    if (variant === 'destructive') {
      toast.error(`${title}: ${description}`);
    } else {
      toast.success(`${title}: ${description}`);
    }
  };

  return {
    toast: showToast,
  };
}; 