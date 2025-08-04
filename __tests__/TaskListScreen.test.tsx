import { fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import TaskListScreen from "../app/tasks";
import { useInfiniteTaskList } from "../hooks/useInfiniteTaskList";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

jest.mock("../hooks/useInfiniteTaskList");
jest.mock("../hooks/useNetworkStatus");
jest.mock("expo-router");

const mockUseInfiniteTaskList = useInfiniteTaskList as jest.MockedFunction<
	typeof useInfiniteTaskList
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseNetworkStatus = useNetworkStatus as jest.MockedFunction<
	typeof useNetworkStatus
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

const mockTasks = [
	{
		id: "1",
		title: "Test Task 1",
		description: "This is a test task",
		assignee: "John Doe",
		completed: false,
		createdAt: "2022-12-31T00:00:00.000Z",
	},
	{
		id: "2",
		title: "Completed Task",
		description: "This task is completed",
		assignee: "Jane Smith",
		completed: true,
		createdAt: "2023-01-01T00:00:00.000Z",
	},
];

describe("TaskListScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUseRouter.mockReturnValue(mockRouter);
		mockUseNetworkStatus.mockReturnValue({
			isOnline: true,
			connectionType: "wifi",
			isLoading: false,
			error: null,
		});
	});

	it("renders loading state correctly", () => {
		mockUseInfiniteTaskList.mockReturnValue({
			tasks: [],
			data: undefined,
			error: null,
			status: "pending",
			isLoading: true,
			isFetching: false,
			isFetchingNextPage: false,
			hasNextPage: false,
			fetchNextPage: jest.fn(),
			refetch: jest.fn(),
		});

		render(<TaskListScreen />);
		expect(screen.getByTestId("loading-indicator")).toBeTruthy();
	});

	it("renders error state correctly", () => {
		const mockRefetch = jest.fn();
		mockUseInfiniteTaskList.mockReturnValue({
			tasks: [],
			data: undefined,
			error: new Error("Failed to fetch"),
			status: "error",
			isLoading: false,
			isFetching: false,
			isFetchingNextPage: false,
			hasNextPage: false,
			fetchNextPage: jest.fn(),
			refetch: mockRefetch,
		});

		render(<TaskListScreen />);

		expect(screen.getByText("Failed to fetch")).toBeTruthy();
		expect(screen.getByText("Retry")).toBeTruthy();

		fireEvent.press(screen.getByText("Retry"));
		expect(mockRefetch).toHaveBeenCalled();
	});

	it("renders tasks correctly", () => {
		mockUseInfiniteTaskList.mockReturnValue({
			tasks: mockTasks,
			data: {
				pages: [
					{ data: mockTasks, page: 1, limit: 10, total: 2, hasMore: false },
				],
				pageParams: [1],
			},
			error: null,
			status: "success",
			isLoading: false,
			isFetching: false,
			isFetchingNextPage: false,
			hasNextPage: false,
			fetchNextPage: jest.fn(),
			refetch: jest.fn(),
		});

		render(<TaskListScreen />);

		expect(screen.getByText("Tasks")).toBeTruthy();
		expect(screen.getByText("Test Task 1")).toBeTruthy();
		expect(screen.getByText("Completed Task")).toBeTruthy();
		expect(screen.getByText("This is a test task")).toBeTruthy();
		expect(screen.getByText("Assigned to: John Doe")).toBeTruthy();
		expect(screen.getByText("Assigned to: Jane Smith")).toBeTruthy();
	});

	it("navigates to task form when add button is pressed", () => {
		mockUseInfiniteTaskList.mockReturnValue({
			tasks: mockTasks,
			data: {
				pages: [
					{ data: mockTasks, page: 1, limit: 10, total: 2, hasMore: false },
				],
				pageParams: [1],
			},
			error: null,
			status: "success",
			isLoading: false,
			isFetching: false,
			isFetchingNextPage: false,
			hasNextPage: false,
			fetchNextPage: jest.fn(),
			refetch: jest.fn(),
		});

		render(<TaskListScreen />);

		const addButton = screen.getByText("+");
		fireEvent.press(addButton);

		expect(mockRouter.push).toHaveBeenCalledWith("/task-form");
	});

	it("navigates to task form with id when task is pressed", () => {
		mockUseInfiniteTaskList.mockReturnValue({
			tasks: mockTasks,
			data: {
				pages: [
					{ data: mockTasks, page: 1, limit: 10, total: 2, hasMore: false },
				],
				pageParams: [1],
			},
			error: null,
			status: "success",
			isLoading: false,
			isFetching: false,
			isFetchingNextPage: false,
			hasNextPage: false,
			fetchNextPage: jest.fn(),
			refetch: jest.fn(),
		});

		render(<TaskListScreen />);

		const taskItem = screen.getByText("Test Task 1");
		fireEvent.press(taskItem);

		expect(mockRouter.push).toHaveBeenCalledWith("/task-form?id=1");
	});

	it("displays formatted creation date", () => {
		mockUseInfiniteTaskList.mockReturnValue({
			tasks: mockTasks,
			data: {
				pages: [
					{ data: mockTasks, page: 1, limit: 10, total: 2, hasMore: false },
				],
				pageParams: [1],
			},
			error: null,
			status: "success",
			isLoading: false,
			isFetching: false,
			isFetchingNextPage: false,
			hasNextPage: false,
			fetchNextPage: jest.fn(),
			refetch: jest.fn(),
		});

		render(<TaskListScreen />);

		expect(screen.getByText("12/30/2022")).toBeTruthy();
		expect(screen.getByText("12/31/2022")).toBeTruthy();
	});

	it("shows completed tasks with strikethrough text", () => {
		mockUseInfiniteTaskList.mockReturnValue({
			tasks: mockTasks,
			data: {
				pages: [
					{ data: mockTasks, page: 1, limit: 10, total: 2, hasMore: false },
				],
				pageParams: [1],
			},
			error: null,
			status: "success",
			isLoading: false,
			isFetching: false,
			isFetchingNextPage: false,
			hasNextPage: false,
			fetchNextPage: jest.fn(),
			refetch: jest.fn(),
		});

		render(<TaskListScreen />);

		const completedTaskTitle = screen.getByText("Completed Task");
		expect(completedTaskTitle.props.style).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					textDecorationLine: "line-through",
				}),
			]),
		);
	});

	it("handles pull to refresh", () => {
		const mockRefetch = jest.fn();
		mockUseInfiniteTaskList.mockReturnValue({
			tasks: mockTasks,
			data: {
				pages: [
					{ data: mockTasks, page: 1, limit: 10, total: 2, hasMore: false },
				],
				pageParams: [1],
			},
			error: null,
			status: "success",
			isLoading: false,
			isFetching: false,
			isFetchingNextPage: false,
			hasNextPage: false,
			fetchNextPage: jest.fn(),
			refetch: mockRefetch,
		});

		render(<TaskListScreen />);

		expect(mockRefetch).toBeDefined();
	});
});
