import { Alert } from "react-native";
import { ApiError } from "../services/api";

/**
 * Handles mutation errors by displaying user-friendly messages and logging the error
 * @param error - The error to handle
 * @param defaultMessage - Default message to show if error type is unknown
 *
 * @example
 * ```tsx
 * try {
 *   await mutation.mutateAsync(data);
 * } catch (error) {
 *   handleMutationError(error, "Failed to save task");
 * }
 * ```
 */
export function handleMutationError(error: unknown, defaultMessage: string) {
	let errorMessage = defaultMessage;

	if (error instanceof ApiError) {
		errorMessage = error.message;
		if (error.statusCode === 401) {
			errorMessage = "Authentication failed. Please check your credentials.";
		} else if (error.statusCode === 404) {
			errorMessage = "Resource not found. Please try again.";
		} else if (error.statusCode === 500) {
			errorMessage = "Server error. Please try again later.";
		}
	} else if (error instanceof Error) {
		errorMessage = error.message;
	}

	Alert.alert("Error", errorMessage, [{ text: "OK" }]);
	console.error("Mutation error:", error);
}

/**
 * Extracts a user-friendly error message from any error type
 * @param error - The error to extract message from
 * @returns {string} User-friendly error message
 *
 * @example
 * ```tsx
 * const message = getErrorMessage(error);
 * setText(message);
 * ```
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		return error.message;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return "An unknown error occurred";
}

/**
 * Determines if an error is network-related
 * @param error - The error to check
 * @returns {boolean} True if the error is network-related
 *
 * @example
 * ```tsx
 * if (isNetworkError(error)) {
 *   // Show offline UI
 * } else {
 *   // Show other error UI
 * }
 * ```
 */
export function isNetworkError(error: unknown): boolean {
	if (error instanceof ApiError) {
		return error.statusCode === undefined || error.statusCode === 0;
	}
	if (error instanceof Error) {
		return (
			error.message.includes("Network") ||
			error.message.includes("fetch") ||
			error.message.includes("timeout")
		);
	}
	return false;
}

/**
 * Determines if an error is retryable (temporary failure)
 * @param error - The error to check
 * @returns {boolean} True if the error is retryable
 *
 * @example
 * ```tsx
 * if (isRetryableError(error)) {
 *   // Retry the operation
 *   setTimeout(() => retry(), 1000);
 * } else {
 *   // Show permanent error
 * }
 * ```
 */
export function isRetryableError(error: unknown): boolean {
	if (error instanceof ApiError) {
		return (
			error.statusCode === 408 || // Request Timeout
			error.statusCode === 429 || // Too Many Requests
			error.statusCode === 500 || // Internal Server Error
			error.statusCode === 502 || // Bad Gateway
			error.statusCode === 503 || // Service Unavailable
			error.statusCode === 504 || // Gateway Timeout
			error.statusCode === undefined
		); // Network errors
	}
	return isNetworkError(error);
}
