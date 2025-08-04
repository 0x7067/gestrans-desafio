import { API } from "../constants";
import type { Task } from "../types/Task";

const API_BASE_URL = API.BASE_URL;

export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	limit: number;
	total: number;
	hasMore: boolean;
}

interface PaginationParams {
	page?: number;
	limit?: number;
}

export class ApiError extends Error {
	constructor(
		message: string,
		public statusCode?: number,
		public response?: Response,
		public details?: unknown,
	) {
		super(message);
		this.name = "ApiError";
		Object.setPrototypeOf(this, ApiError.prototype);
	}

	static isApiError(error: unknown): error is ApiError {
		return error instanceof ApiError;
	}

	static fromResponse(response: Response, message?: string): ApiError {
		const errorMessage =
			message || `HTTP ${response.status}: ${response.statusText}`;
		return new ApiError(errorMessage, response.status, response);
	}

	static fromNetworkError(error: Error): ApiError {
		return new ApiError(
			`Network error: ${error.message}`,
			undefined,
			undefined,
			error,
		);
	}

	static fromTimeout(): ApiError {
		return new ApiError("Request timeout");
	}

	static fromJsonError(response: Response): ApiError {
		return new ApiError("Invalid JSON response", response.status, response);
	}
}

const handleResponse = async <T>(response: Response): Promise<T> => {
	if (!response.ok) {
		throw ApiError.fromResponse(response);
	}

	try {
		return await response.json();
	} catch (error) {
		throw ApiError.fromJsonError(response);
	}
};

const fetchWithTimeout = async (
	url: string,
	options: RequestInit = {},
	timeout = API.DEFAULT_TIMEOUT,
): Promise<Response> => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
		});
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		if (error instanceof Error && error.name === "AbortError") {
			throw ApiError.fromTimeout();
		}
		if (error instanceof Error) {
			throw ApiError.fromNetworkError(error);
		}
		throw new ApiError("Unknown network error");
	}
};

export const taskApi = {
	/**
	 * Fetches all tasks from the API
	 * @returns Promise<Task[]> - Array of all tasks
	 * @throws {ApiError} When the request fails
	 */
	getAll: async (): Promise<Task[]> => {
		const response = await fetchWithTimeout(`${API_BASE_URL}/tasks`);
		return handleResponse<Task[]>(response);
	},

	/**
	 * Fetches paginated tasks from the API
	 * @param params - Pagination parameters
	 * @param params.page - Page number (default: 1)
	 * @param params.limit - Number of items per page (default: 10)
	 * @returns Promise<PaginatedResponse<Task>> - Paginated response with tasks and metadata
	 * @throws {ApiError} When the request fails
	 */
	getPaginated: async ({
		page = 1,
		limit = 10,
	}: PaginationParams = {}): Promise<PaginatedResponse<Task>> => {
		const url = new URL(`${API_BASE_URL}/tasks`);
		url.searchParams.append("page", page.toString());
		url.searchParams.append("limit", limit.toString());

		const response = await fetchWithTimeout(url.toString());
		const tasks: Task[] = await handleResponse<Task[]>(response);

		// Since mockapi.io doesn't return pagination metadata in response,
		// we need to determine if there are more pages by checking if we got a full page
		const hasMore = tasks.length === limit;

		return {
			data: tasks,
			page,
			limit,
			total: tasks.length, // This is approximate since we don't get total from API
			hasMore,
		};
	},

	/**
	 * Fetches a single task by ID
	 * @param id - The task ID
	 * @returns Promise<Task> - The requested task
	 * @throws {ApiError} When the task is not found or request fails
	 */
	getById: async (id: string): Promise<Task> => {
		const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/${id}`);
		return handleResponse<Task>(response);
	},

	/**
	 * Creates a new task
	 * @param task - Task data without ID and createdAt
	 * @returns Promise<Task> - The created task with server-generated ID and timestamp
	 * @throws {ApiError} When the creation fails
	 */
	create: async (task: Omit<Task, "id" | "createdAt">): Promise<Task> => {
		const response = await fetchWithTimeout(`${API_BASE_URL}/tasks`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(task),
		});
		return handleResponse<Task>(response);
	},

	/**
	 * Updates an existing task
	 * @param id - The task ID to update
	 * @param task - Partial task data with fields to update
	 * @returns Promise<Task> - The updated task
	 * @throws {ApiError} When the update fails
	 */
	update: async (id: string, task: Partial<Task>): Promise<Task> => {
		const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(task),
		});
		return handleResponse<Task>(response);
	},

	/**
	 * Deletes a task by ID
	 * @param id - The task ID to delete
	 * @returns Promise<void> - Resolves when the task is successfully deleted
	 * @throws {ApiError} When the deletion fails
	 */
	delete: async (id: string): Promise<void> => {
		const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/${id}`, {
			method: "DELETE",
		});
		if (!response.ok) {
			await handleResponse(response);
		}
	},
};
