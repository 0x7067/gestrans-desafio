import { useQuery } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import TaskFormScreen from "../app/task-form";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useTaskForm } from "../hooks/useTaskForm";
import type { UseTaskMutationsReturn } from "../hooks/useTaskMutations";
import { useTaskMutations } from "../hooks/useTaskMutations";
import type { TaskFormData } from "../hooks/useTaskValidation";

jest.mock("@tanstack/react-query");
jest.mock("expo-router");
jest.mock("../hooks/useTaskForm");
jest.mock("../hooks/useTaskMutations");
jest.mock("../hooks/useNetworkStatus");

// Mock Controller component
interface MockControllerProps {
	render: (props: {
		field: { onChange: jest.Mock; onBlur: jest.Mock; value: string };
	}) => React.ReactElement;
}

jest.mock("react-hook-form", () => ({
	Controller: ({ render }: MockControllerProps) => {
		const mockField = {
			onChange: jest.fn(),
			onBlur: jest.fn(),
			value: "test value",
		};
		return render({ field: mockField });
	},
}));
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
	typeof useLocalSearchParams
>;

const mockUseTaskForm = useTaskForm as jest.MockedFunction<typeof useTaskForm>;
const mockUseTaskMutations = useTaskMutations as jest.MockedFunction<
	typeof useTaskMutations
>;
const mockUseNetworkStatus = useNetworkStatus as jest.MockedFunction<
	typeof useNetworkStatus
>;

const mockTask = {
	id: "1",
	title: "Test Task",
	description: "Test Description",
	assignee: "John Doe",
	completed: false,
	createdAt: "2023-01-01T00:00:00.000Z",
};

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

const mockFormHook = {
	control: {} as UseFormReturn<TaskFormData>["control"],
	handleSubmit: jest.fn(
		(fn) => () =>
			fn({
				title: "Test Task",
				description: "Test Description",
				assignee: "John Doe",
				completed: false,
			}),
	),
	formState: {
		errors: {},
		isSubmitted: false,
		isValid: true,
		isDirty: false,
		isLoading: false,
		touchedFields: {},
		dirtyFields: {},
		isSubmitSuccessful: false,
		submitCount: 0,
		defaultValues: undefined,
	},
	getValues: jest.fn(() => ({
		title: "Test Task",
		description: "Test Description",
		assignee: "John Doe",
		completed: false,
	})),
	setValue: jest.fn(),
	reset: jest.fn(),
	trigger: jest.fn(),
	clearErrors: jest.fn(),
	setError: jest.fn(),
	watch: jest.fn(),
	getFieldState: jest.fn(),
	resetField: jest.fn(),
	unregister: jest.fn(),
	register: jest.fn(),
	setFocus: jest.fn(),
} as unknown as UseFormReturn<TaskFormData>;

const mockMutationsHook: UseTaskMutationsReturn = {
	createMutation: {
		mutate: jest.fn(),
		mutateAsync: jest.fn(),
		reset: jest.fn(),
		status: "idle",
		isIdle: true,
		isPending: false,
		isSuccess: false,
		isError: false,
		data: undefined,
		error: null,
		variables: undefined,
		context: undefined,
		failureCount: 0,
		failureReason: null,
	} as any,
	updateMutation: {
		mutate: jest.fn(),
		mutateAsync: jest.fn(),
		reset: jest.fn(),
		status: "idle",
		isIdle: true,
		isPending: false,
		isSuccess: false,
		isError: false,
		data: undefined,
		error: null,
		variables: undefined,
		context: undefined,
		failureCount: 0,
		failureReason: null,
	} as any,
	deleteMutation: {
		mutate: jest.fn(),
		mutateAsync: jest.fn(),
		reset: jest.fn(),
		status: "idle",
		isIdle: true,
		isPending: false,
		isSuccess: false,
		isError: false,
		data: undefined,
		error: null,
		variables: undefined,
		context: undefined,
		failureCount: 0,
		failureReason: null,
	} as any,
	handleSave: jest.fn(),
	handleDelete: jest.fn(),
};

describe("TaskFormScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		mockUseTaskForm.mockReturnValue(mockFormHook);
		mockUseTaskMutations.mockReturnValue(mockMutationsHook);
		mockUseNetworkStatus.mockReturnValue({
			isOnline: true,
			connectionType: "wifi",
			isLoading: false,
			error: null,
		});
	});

	describe("Create Mode", () => {
		beforeEach(() => {
			mockUseLocalSearchParams.mockReturnValue({});
			mockUseQuery.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
			} as any);
		});

		it("renders create form correctly", () => {
			render(<TaskFormScreen />);

			expect(screen.getByText("Title *")).toBeTruthy();
			expect(screen.getByText("Description")).toBeTruthy();
			expect(screen.getByText("Assignee *")).toBeTruthy();
			expect(screen.getByText("Create Task")).toBeTruthy();

			expect(screen.queryByTestId("completed-switch")).toBeNull();
			expect(screen.queryByTestId("delete-button")).toBeNull();
		});

		it("renders form inputs correctly", () => {
			render(<TaskFormScreen />);

			const titleInput = screen.getByTestId("title-input");
			const descriptionInput = screen.getByTestId("description-input");
			const assigneeInput = screen.getByTestId("assignee-input");

			expect(titleInput).toBeTruthy();
			expect(descriptionInput).toBeTruthy();
			expect(assigneeInput).toBeTruthy();
		});

		it("handles save button press correctly", () => {
			render(<TaskFormScreen />);

			const saveButton = screen.getByTestId("save-button");
			fireEvent.press(saveButton);

			expect(mockFormHook.handleSubmit).toHaveBeenCalled();
			expect(mockMutationsHook.handleSave).toHaveBeenCalled();
		});
	});

	describe("Edit Mode", () => {
		beforeEach(() => {
			mockUseLocalSearchParams.mockReturnValue({ id: "1" });
			mockUseQuery.mockReturnValue({
				data: mockTask,
				isLoading: false,
				error: null,
			} as any);
		});

		it("renders edit form correctly", () => {
			render(<TaskFormScreen />);

			expect(screen.getByTestId("title-input")).toBeTruthy();
			expect(screen.getByTestId("description-input")).toBeTruthy();
			expect(screen.getByTestId("assignee-input")).toBeTruthy();
			expect(screen.getByTestId("completed-switch")).toBeTruthy();
			expect(screen.getByTestId("save-button")).toBeTruthy();
			expect(screen.getByTestId("delete-button")).toBeTruthy();
			expect(screen.getByText("Update Task")).toBeTruthy();
			expect(screen.getByText("Delete Task")).toBeTruthy();
		});

		it("renders completed switch in edit mode", () => {
			render(<TaskFormScreen />);

			const completedSwitch = screen.getByTestId("completed-switch");
			expect(completedSwitch).toBeTruthy();
		});

		it("handles delete button press correctly", () => {
			render(<TaskFormScreen />);

			const deleteButton = screen.getByTestId("delete-button");
			fireEvent.press(deleteButton);

			expect(mockMutationsHook.handleDelete).toHaveBeenCalledWith("1");
		});
	});

	describe("Loading State", () => {
		beforeEach(() => {
			mockUseLocalSearchParams.mockReturnValue({ id: "1" });
			mockUseQuery.mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null,
			} as any);
		});

		it("renders loading state correctly", () => {
			render(<TaskFormScreen />);

			expect(screen.getByTestId("loading-indicator")).toBeTruthy();
			expect(screen.getByText("Loading task...")).toBeTruthy();
		});
	});

	describe("Validation", () => {
		beforeEach(() => {
			mockUseLocalSearchParams.mockReturnValue({});
			mockUseQuery.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
			} as any);
		});

		it("shows validation errors when form has errors", () => {
			const mockFormWithErrors = {
				...mockFormHook,
				formState: {
					errors: {
						title: { message: "Title is required" },
						assignee: { message: "Assignee is required" },
					},
					isSubmitted: true,
					isValid: false,
					isDirty: true,
					isLoading: false,
					isSubmitSuccessful: false,
					isSubmitting: false,
					touchedFields: {},
					dirtyFields: {},
					submitCount: 1,
					isValidating: false,
					disabled: false,
					validatingFields: {},
					isReady: true,
				},
			} as any;
			mockUseTaskForm.mockReturnValue(mockFormWithErrors);

			render(<TaskFormScreen />);

			expect(screen.getByText("Title is required")).toBeTruthy();
			expect(screen.getByText("Assignee is required")).toBeTruthy();
		});
	});

	describe("Loading States for Mutations", () => {
		beforeEach(() => {
			mockUseLocalSearchParams.mockReturnValue({});
			mockUseQuery.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
			} as any);
		});

		it("disables save button and shows loading text when creating", () => {
			const mockMutationsLoading = {
				...mockMutationsHook,
				createMutation: {
					...mockMutationsHook.createMutation,
					isPending: true,
					mutate: jest.fn(),
					status: "pending",
					isIdle: false,
					isError: false,
					isSuccess: false,
					data: undefined,
					variables: undefined,
					error: null,
					reset: jest.fn(),
					mutateAsync: jest.fn(),
					failureCount: 0,
					failureReason: null,
					context: undefined,
				},
			} as any;
			mockUseTaskMutations.mockReturnValue(mockMutationsLoading);

			render(<TaskFormScreen />);

			const saveButton = screen.getByTestId("save-button");
			expect(saveButton.props.disabled).toBe(true);
			expect(screen.getByText("Saving...")).toBeTruthy();
		});

		it("disables delete button and shows loading text when deleting", () => {
			mockUseLocalSearchParams.mockReturnValue({ id: "1" });
			mockUseQuery.mockReturnValue({
				data: mockTask,
				isLoading: false,
				error: null,
			} as any);

			const mockMutationsLoading = {
				...mockMutationsHook,
				deleteMutation: {
					...mockMutationsHook.deleteMutation,
					isPending: true,
					mutate: jest.fn(),
					status: "pending",
					isIdle: false,
					isError: false,
					isSuccess: false,
					data: undefined,
					variables: undefined,
					error: null,
					reset: jest.fn(),
					mutateAsync: jest.fn(),
					failureCount: 0,
					failureReason: null,
					context: undefined,
				},
			} as any;
			mockUseTaskMutations.mockReturnValue(mockMutationsLoading);

			render(<TaskFormScreen />);

			const deleteButton = screen.getByTestId("delete-button");
			expect(deleteButton.props.disabled).toBe(true);
			expect(screen.getByText("Deleting...")).toBeTruthy();
		});
	});
});
