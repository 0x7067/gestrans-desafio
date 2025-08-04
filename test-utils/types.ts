/**
 * Type definitions for test mocks and utilities
 */

import type { NetworkStatus } from "../hooks/useNetworkStatus";
import { ApiError } from "../services/api";
import type { Task } from "../types/Task";

// Mock Response type for fetch
export interface MockResponse {
	ok: boolean;
	status: number;
	statusText?: string;
	json?: jest.Mock;
}

// Mock fetch function
export type MockFetch = (
	url: string,
	options?: RequestInit,
) => Promise<MockResponse>;

// Mock router
export interface MockRouter {
	push: jest.Mock;
	back: jest.Mock;
	replace: jest.Mock;
	canGoBack: jest.Mock;
	navigate: jest.Mock;
	dismiss: jest.Mock;
	dismissTo: jest.Mock;
	canDismiss: jest.Mock;
	go: jest.Mock;
	setParams: jest.Mock;
	getId: jest.Mock;
	getState: jest.Mock;
	getParent: jest.Mock;
	getPath: jest.Mock;
	dismissAll: jest.Mock;
	reload: jest.Mock;
	prefetch: jest.Mock;
}

// Mock network status
export interface MockNetworkStatus extends NetworkStatus {
	isOnline: boolean;
	connectionType: string;
	isLoading: boolean;
	error: Error | null;
}

// Mock infinite query result
export interface MockInfiniteQueryResult<T> {
	tasks: T[];
	data?: {
		pages: Array<{
			data: T[];
			page: number;
			limit: number;
			total: number;
			hasMore: boolean;
		}>;
		pageParams: number[];
	};
	error: Error | null;
	status: "pending" | "error" | "success";
	isLoading: boolean;
	isFetching: boolean;
	isFetchingNextPage: boolean;
	hasNextPage: boolean;
	fetchNextPage: jest.Mock;
	refetch: jest.Mock;
}

// Mock mutation result
export interface MockMutationResult<T = unknown> {
	isPending: boolean;
	isSuccess: boolean;
	isError: boolean;
	error: Error | null;
	data: T | null;
	mutate: jest.Mock;
	mutateAsync: jest.Mock;
	reset: jest.Mock;
}

// Mock query result
export interface MockQueryResult<T = unknown> {
	data: T | undefined;
	error: Error | null;
	isLoading: boolean;
	isFetching: boolean;
	isSuccess: boolean;
	isError: boolean;
	refetch: jest.Mock;
}

// Test utilities
export interface TestHelpers {
	createMockTask(overrides?: Partial<Task>): Task;
	createMockTasks(count?: number): Task[];
	createMockApiResponse<T>(data: T): MockResponse;
	createMockErrorResponse(status: number, message?: string): MockResponse;
	createMockNetworkStatus(
		overrides?: Partial<MockNetworkStatus>,
	): MockNetworkStatus;
}

// Test data factories
export const testDataFactory = {
	createMockTask: (overrides: Partial<Task> = {}): Task => ({
		id: "1",
		title: "Test Task",
		description: "Test Description",
		assignee: "John Doe",
		completed: false,
		createdAt: "2023-01-01T00:00:00.000Z",
		...overrides,
	}),

	createMockTasks: (count: number = 2): Task[] => {
		return Array.from({ length: count }, (_, index) => ({
			id: (index + 1).toString(),
			title: `Test Task ${index + 1}`,
			description: `Test Description ${index + 1}`,
			assignee: `Assignee ${index + 1}`,
			completed: index % 2 === 0,
			createdAt: `2023-01-0${index + 1}T00:00:00.000Z`,
		}));
	},

	createMockApiResponse: <T>(data: T): MockResponse => ({
		ok: true,
		status: 200,
		json: jest.fn().mockResolvedValue(data),
	}),

	createMockErrorResponse: (
		status: number,
		message?: string,
	): MockResponse => ({
		ok: false,
		status,
		statusText: message || "Error",
	}),

	createMockNetworkStatus: (
		overrides: Partial<MockNetworkStatus> = {},
	): MockNetworkStatus => ({
		isOnline: true,
		connectionType: "wifi",
		isLoading: false,
		error: null,
		...overrides,
	}),
};

// Type guards for test assertions
export const testTypeGuards = {
	isMockResponse: (response: unknown): response is MockResponse => {
		return (
			typeof response === "object" && response !== null && "ok" in response
		);
	},

	isApiError: (error: unknown): error is ApiError => {
		return error instanceof ApiError;
	},

	isMockRouter: (router: unknown): router is MockRouter => {
		return typeof router === "object" && router !== null && "push" in router;
	},
};

// Jest matchers
declare global {
	namespace jest {
		interface Matchers<R> {
			toBeValidTask(): R;
			toHaveValidNetworkStatus(): R;
			toBeApiError(): R;
		}
	}
}
