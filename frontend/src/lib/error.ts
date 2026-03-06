import { AxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import type { ApiErrorResponse } from '../types/auth';

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as ApiErrorResponse;
    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }
    if (typeof data.message === 'string') {
      return data.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export function showErrorNotification(error: unknown): void {
  notifications.show({
    title: 'Error',
    message: extractErrorMessage(error),
    color: 'red',
  });
}
