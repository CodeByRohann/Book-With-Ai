// Author: Sanket
// Centralized error handling utility with user-friendly notifications
import { toast } from 'sonner';

/**
 * Handles errors with user-friendly toast notifications
 * @param error - The error object
 * @param userMessage - User-friendly error message to display
 */
export function handleError(error: unknown, userMessage: string): void {
    // Log detailed error for debugging
    console.error('Error occurred:', error);

    // Show user-friendly message
    toast.error(userMessage);
}

/**
 * Displays success message to user
 * @param message - Success message to display
 */
export function handleSuccess(message: string): void {
    toast.success(message);
}

/**
 * Displays info message to user
 * @param message - Info message to display
 */
export function handleInfo(message: string): void {
    toast.info(message);
}

/**
 * Displays warning message to user
 * @param message - Warning message to display
 */
export function handleWarning(message: string): void {
    toast.warning(message);
}
