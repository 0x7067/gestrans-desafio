import { useInfiniteQuery } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react-native";
import { FIVE_MINUTES } from "@/constants/time";
import { useInfiniteTaskList } from "../hooks/useInfiniteTaskList";
import type { Task } from "../types/Task";

// Mock the API
jest.mock("../services/api");

// Mock useInfiniteQuery
jest.mock("@tanstack/react-query", () => ({
	...jest.requireActual("@tanstack/react-query"),
	useInfiniteQuery: jest.fn(),
}));
const mockedUseInfiniteQuery = useInfiniteQuery as jest.MockedFunction<
	typeof useInfiniteQuery
>;

// Mock data
const mockTasks: Task[] = [
	{
		id: "1",
		title: "Task 1",
		description: "Description 1",
		assignee: "User 1",
		completed: false,
		createdAt: "2023-01-01T00:00:00.000Z",
	},
	{
		id: "2",
		title: "Task 2",
		description: "Description 2",
		assignee: "User 2",
		completed: true,
		createdAt: "2023-01-02T00:00:00.000Z",
	},
];

describe("useInfiniteTaskList", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return tasks from flattened pages", () => {
		const mockInfiniteQueryResult = {
			data: {
				pages: [
					{ data: [mockTasks[0]], page: 1, limit: 10, total: 1, hasMore: true },
					{
						data: [mockTasks[1]],
						page: 2,
						limit: 10,
						total: 1,
						hasMore: false,
					},
				],
			},
			error: null,
			status: "success" as const,
			isLoading: false,
			isFetching: false,
			isFetchingNextPage: false,
			hasNextPage: false,
			fetchNextPage: jest.fn(),
			refetch: jest.fn(),
		};

		mockedUseInfiniteQuery.mockReturnValue(mockInfiniteQueryResult as ReturnType<typeof useInfiniteQuery>);

		const { result } = renderHook(() => useInfiniteTaskList());

		expect(result.current.tasks).toEqual(mockTasks);
		expect(result.current.isLoading).toBe(false);
		expect(result.current.hasNextPage).toBe(false);
	});

	it("should handle loading state", () => {
		const mockInfiniteQueryResult = {
			data: undefined,
			error: null,
			status: "pending" as const,
			isLoading: true,
			isFetching: true,
			isFetchingNextPage: false,
			hasNextPage: false,
			fetchNextPage: jest.fn(),
			refetch: jest.fn(),
		};

		mockedUseInfiniteQuery.mockReturnValue(mockInfiniteQueryResult as ReturnType<typeof useInfiniteQuery>);

		const { result } = renderHook(() => useInfiniteTaskList());

		expect(result.current.tasks).toEqual([]);
		expect(result.current.isLoading).toBe(true);
		expect(result.current.hasNextPage).toBe(false);
	});

	it("should handle error state", () => {
		const mockError = new Error("Network error");
		const mockInfiniteQueryResult = {
			data: undefined,
			error: mockError,
			status: "error" as const,
			isLoading: false,
			isFetching: false,
			isFetchingNextPage: false,
			hasNextPage: false,
			fetchNextPage: jest.fn(),
			refetch: jest.fn(),
		};

		mockedUseInfiniteQuery.mockReturnValue(mockInfiniteQueryResult as ReturnType<typeof useInfiniteQuery>);

		const { result } = renderHook(() => useInfiniteTaskList());

		expect(result.current.tasks).toEqual([]);
		expect(result.current.error).toBe(mockError);
		expect(result.current.status).toBe("error");
	});

	it("should handle fetchNextPage correctly", () => {
		const mockFetchNextPage = jest.fn();
		const mockInfiniteQueryResult = {
			data: {
				pages: [
					{ data: [mockTasks[0]], page: 1, limit: 10, total: 1, hasMore: true },
				],
			},
			error: null,
			status: "success" as const,
			isLoading: false,
			isFetching: false,
			isFetchingNextPage: false,
			hasNextPage: true,
			fetchNextPage: mockFetchNextPage,
			refetch: jest.fn(),
		};

		mockedUseInfiniteQuery.mockReturnValue(mockInfiniteQueryResult as ReturnType<typeof useInfiniteQuery>);

		const { result } = renderHook(() => useInfiniteTaskList());

		expect(result.current.hasNextPage).toBe(true);
		expect(result.current.fetchNextPage).toBe(mockFetchNextPage);
	});

	it("should use custom page size in query key", () => {
		const mockInfiniteQueryResult = {
			data: { pages: [] },
			error: null,
			status: "success" as const,
			isLoading: false,
			isFetching: false,
			isFetchingNextPage: false,
			hasNextPage: false,
			fetchNextPage: jest.fn(),
			refetch: jest.fn(),
		};

		mockedUseInfiniteQuery.mockReturnValue(mockInfiniteQueryResult as ReturnType<typeof useInfiniteQuery>);

		renderHook(() => useInfiniteTaskList({ pageSize: 5 }));

		expect(mockedUseInfiniteQuery).toHaveBeenCalledWith({
			queryKey: ["tasks", "infinite", 5],
			queryFn: expect.any(Function),
			initialPageParam: 1,
			getNextPageParam: expect.any(Function),
			staleTime: FIVE_MINUTES,
			refetchOnWindowFocus: false,
		});
	});
});
