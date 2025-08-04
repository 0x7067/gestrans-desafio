import { useMutation, useQueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";

import { Alert } from "react-native";
import { useTaskMutations } from "../hooks/useTaskMutations";
import { taskApi } from "../services/api";

jest.mock("@tanstack/react-query");

jest.mock("react-native", () => ({
	Alert: {
		alert: jest.fn(),
	},
}));
jest.mock("../services/api");

const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;
const mockUseQueryClient = useQueryClient as jest.MockedFunction<
	typeof useQueryClient
>;
const mockRouter = {
	push: jest.fn(),
	back: jest.fn(),
	replace: jest.fn(),
	canGoBack: jest.fn(() => true),
	navigate: jest.fn(),
	dismiss: jest.fn(),
	dismissTo: jest.fn(),
	canDismiss: jest.fn(() => true),
	go: jest.fn(),
	setParams: jest.fn(),
	getId: jest.fn(),
	getState: jest.fn(),
	getParent: jest.fn(),
	getPath: jest.fn(),
	dismissAll: jest.fn(),
	reload: jest.fn(),
	prefetch: jest.fn(),
};

const mockQueryClient = {
	invalidateQueries: jest.fn(),
	mount: jest.fn(),
	unmount: jest.fn(),
	isFetching: jest.fn(),
	getQueryData: jest.fn(),
	setQueryData: jest.fn(),
	removeQueries: jest.fn(),
	resetQueries: jest.fn(),
	refetchQueries: jest.fn(),
	fetchQuery: jest.fn(),
	prefetchQuery: jest.fn(),
	cancelQueries: jest.fn(),
	getQueryCache: jest.fn(),
	getMutationCache: jest.fn(),
	getDefaultOptions: jest.fn(),
	setDefaultOptions: jest.fn(),
	getQueryDefaults: jest.fn(),
	setQueryDefaults: jest.fn(),
	getMutationDefaults: jest.fn(),
	setMutationDefaults: jest.fn(),
	clear: jest.fn(),
	isMutating: jest.fn(),
	ensureQueryData: jest.fn(),
	getQueriesData: jest.fn(),
	setQueriesData: jest.fn(),
	getQueryState: jest.fn(),
	fetchInfiniteQuery: jest.fn(),
	prefetchInfiniteQuery: jest.fn(),
	ensureInfiniteQueryData: jest.fn(),
	resumePausedMutations: jest.fn(),
	defaultQueryOptions: jest.fn(),
	defaultMutationOptions: jest.fn(),
} as any;

describe("useTaskMutations", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUseQueryClient.mockReturnValue(mockQueryClient);

		mockUseMutation.mockImplementation(() => ({
			mutate: jest.fn(),
			mutateAsync: jest.fn(),
			isPending: false,
			isError: false,
			isSuccess: false,
			isIdle: true,
			status: "idle",
			error: null,
			data: undefined,
			variables: undefined,
			context: undefined,
			failureCount: 0,
			failureReason: null,
			isPaused: false,
			submittedAt: 0,
			reset: jest.fn(),
		}));
	});

	it("initializes mutations correctly", () => {
		const { result } = renderHook(() => useTaskMutations());

		expect(result.current.createMutation).toBeDefined();
		expect(result.current.updateMutation).toBeDefined();
		expect(result.current.deleteMutation).toBeDefined();
		expect(result.current.handleSave).toBeDefined();
		expect(result.current.handleDelete).toBeDefined();
	});

	describe("createMutation", () => {
		it("calls taskApi.create with correct data", () => {
			renderHook(() => useTaskMutations());

			const createMutationFn = mockUseMutation.mock.calls.find(
				(call) => call[0].mutationFn === taskApi.create,
			)?.[0]?.mutationFn;

			expect(createMutationFn).toBe(taskApi.create);
		});

		it("handles successful creation", () => {
			renderHook(() => useTaskMutations());

			const createMutationOptions = mockUseMutation.mock.calls.find(
				(call) => call[0].mutationFn === taskApi.create,
			)?.[0];

			act(() => {
				mockQueryClient.getQueryCache.mockReturnValue({
					findAll: jest.fn(() => []),
				});
				createMutationOptions?.onSuccess?.(
					{
						id: "123",
						createdAt: new Date().toISOString(),
						title: "t",
						description: "d",
						assignee: "a",
						completed: false,
					} as any,
					{} as any,
					{} as any,
				);
				createMutationOptions?.onSettled?.(
					{} as any,
					null,
					{} as any,
					{} as any,
				);
			});

			expect(mockQueryClient.setQueryData).toHaveBeenCalledTimes(0);
			expect(mockRouter.back).not.toHaveBeenCalled();
		});

		it("handles creation error", () => {
			renderHook(() => useTaskMutations());

			const createMutationOptions = mockUseMutation.mock.calls.find(
				(call) => call[0].mutationFn === taskApi.create,
			)?.[0];

			const error = new Error("Creation failed");

			act(() => {
				createMutationOptions?.onError?.(error, {} as any, {} as any);
			});

			expect(Alert.alert).toHaveBeenCalledWith("Error", "Creation failed", [
				{ text: "OK" },
			]);
			expect(console.error).toHaveBeenCalledWith("Mutation error:", error);
		});
	});

	describe("updateMutation", () => {
		it("handles successful update", () => {
			renderHook(() => useTaskMutations());

			const updateMutationOptions = mockUseMutation.mock.calls[1]?.[0];

			const mockTask = { id: "1", data: { title: "Updated Task" } };

			act(() => {
				updateMutationOptions?.onSuccess?.({} as any, mockTask, {} as any);
				updateMutationOptions?.onSettled?.(
					{} as any,
					null,
					mockTask,
					{} as any,
				);
			});

			expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
				queryKey: ["tasks"],
				exact: false,
			});
			expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
				queryKey: ["task", "1"],
			});
			expect(mockRouter.back).not.toHaveBeenCalled();
		});

		it("handles update error", () => {
			renderHook(() => useTaskMutations());

			const updateMutationOptions = mockUseMutation.mock.calls[1]?.[0];

			const error = new Error("Update failed");
			const mockTask = { id: "1", data: { title: "Updated Task" } };

			act(() => {
				updateMutationOptions?.onError?.(error, mockTask, {} as any);
			});

			expect(Alert.alert).toHaveBeenCalledWith("Error", "Update failed", [
				{ text: "OK" },
			]);
		});
	});

	describe("deleteMutation", () => {
		it("handles successful deletion", () => {
			renderHook(() => useTaskMutations());

			const deleteMutationOptions = mockUseMutation.mock.calls[2]?.[0];

			act(() => {
				deleteMutationOptions?.onSuccess?.(undefined, "1", {} as any);
				deleteMutationOptions?.onSettled?.(undefined, null, "1", {} as any);
			});

			expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
				queryKey: ["tasks"],
				exact: false,
			});
			expect(mockRouter.back).not.toHaveBeenCalled();
		});

		it("handles deletion error", () => {
			renderHook(() => useTaskMutations());

			const deleteMutationOptions = mockUseMutation.mock.calls[2]?.[0];

			const error = new Error("Deletion failed");

			act(() => {
				deleteMutationOptions?.onError?.(error, "1", {} as any);
			});

			expect(Alert.alert).toHaveBeenCalledWith("Error", "Deletion failed", [
				{ text: "OK" },
			]);
		});
	});

	describe("handleSave", () => {
		it("calls createMutation when not editing", () => {
			const { result } = renderHook(() => useTaskMutations());

			const taskData = {
				title: "Test Task",
				description: "Test Description",
				assignee: "John Doe",
				completed: false,
			};

			act(() => {
				result.current.handleSave(taskData, false);
			});

			expect(result.current.createMutation.mutate).toHaveBeenCalledWith(
				taskData,
			);
		});

		it("calls updateMutation when editing", () => {
			const { result } = renderHook(() => useTaskMutations());

			const taskData = {
				title: "Updated Task",
				description: "Updated Description",
				assignee: "Jane Doe",
				completed: true,
			};

			act(() => {
				result.current.handleSave(taskData, true, "1");
			});

			expect(result.current.updateMutation.mutate).toHaveBeenCalledWith({
				id: "1",
				data: taskData,
			});
		});
	});

	describe("handleDelete", () => {
		it("shows confirmation alert and deletes on confirmation", () => {
			const { result } = renderHook(() => useTaskMutations());

			act(() => {
				result.current.handleDelete("1");
			});

			expect(Alert.alert).toHaveBeenCalledWith(
				"Delete Task",
				"Are you sure you want to delete this task?",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Delete",
						style: "destructive",
						onPress: expect.any(Function),
					},
				],
			);

			const deleteButton = (Alert.alert as jest.Mock).mock.calls[0][2][1];
			act(() => {
				deleteButton.onPress();
			});

			expect(result.current.deleteMutation.mutate).toHaveBeenCalledWith("1");
		});
	});
});
