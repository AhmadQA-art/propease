import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';

export const handleError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.response?.data?.error || error.message;
    toast.error(message);
    return message;
  }
  
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  toast.error(message);
  return message;
}; 