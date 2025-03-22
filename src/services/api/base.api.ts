
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Standard error response format
 */
export interface ApiError {
  message: string;
  details?: any;
  status?: number;
}

/**
 * Standard success response format
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: 'success' | 'error';
}

/**
 * Creates a standardized API response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    error: null,
    status: 'success',
  };
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse<T>(message: string, details?: any): ApiResponse<T> {
  console.error(`API Error: ${message}`, details);
  
  return {
    data: null,
    error: {
      message,
      details,
    },
    status: 'error',
  };
}

/**
 * Shows a toast notification for API errors
 */
export function handleApiError(error: any, customMessage?: string): void {
  const message = customMessage || 'An error occurred. Please try again.';
  console.error('API Error:', error);
  toast.error(message);
}

/**
 * Shared Supabase instance for API services
 */
export { supabase };
