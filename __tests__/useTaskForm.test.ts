import { act, renderHook } from "@testing-library/react-native";
import { useTaskForm } from "../hooks/useTaskForm";
import type { Task } from "../types/Task";

const mockTask: Task = {
	id: "1",
	title: "Test Task",
	description: "Test Description",
	assignee: "John Doe",
	completed: false,
	createdAt: "2023-01-01T00:00:00.000Z",
};

describe("useTaskForm", () => {
	it("initializes with empty values when no task is provided", () => {
		const { result } = renderHook(() => useTaskForm());

		const values = result.current.getValues();
		expect(values.title).toBe("");
		expect(values.description).toBe("");
		expect(values.assignee).toBe("");
		expect(values.completed).toBe(false);
		expect(result.current.formState.isSubmitted).toBe(false);
	});

	it("initializes with task values when task is provided", () => {
		const { result } = renderHook(() => useTaskForm({ task: mockTask }));

		const values = result.current.getValues();
		expect(values.title).toBe("Test Task");
		expect(values.description).toBe("Test Description");
		expect(values.assignee).toBe("John Doe");
		expect(values.completed).toBe(false);
	});

	it("updates state when setValue is called", () => {
		const { result } = renderHook(() => useTaskForm());

		act(() => {
			result.current.setValue("title", "New Title");
		});
		expect(result.current.getValues().title).toBe("New Title");

		act(() => {
			result.current.setValue("description", "New Description");
		});
		expect(result.current.getValues().description).toBe("New Description");

		act(() => {
			result.current.setValue("assignee", "New Assignee");
		});
		expect(result.current.getValues().assignee).toBe("New Assignee");

		act(() => {
			result.current.setValue("completed", true);
		});
		expect(result.current.getValues().completed).toBe(true);
	});

	it("handles form data correctly", () => {
		const { result } = renderHook(() => useTaskForm());

		act(() => {
			result.current.setValue("title", "  Test Title  ");
			result.current.setValue("description", "  Test Description  ");
			result.current.setValue("assignee", "  Test Assignee  ");
			result.current.setValue("completed", true);
		});

		const values = result.current.getValues();

		expect(values).toEqual({
			title: "  Test Title  ",
			description: "  Test Description  ",
			assignee: "  Test Assignee  ",
			completed: true,
		});
	});

	it("resets form to initial state", () => {
		const { result } = renderHook(() => useTaskForm());

		act(() => {
			result.current.setValue("title", "Test Title");
			result.current.setValue("description", "Test Description");
			result.current.setValue("assignee", "Test Assignee");
			result.current.setValue("completed", true);
		});

		act(() => {
			result.current.reset();
		});

		const values = result.current.getValues();
		expect(values.title).toBe("");
		expect(values.description).toBe("");
		expect(values.assignee).toBe("");
		expect(values.completed).toBe(false);
	});

	it("updates state when task prop changes", () => {
		const { result, rerender } = renderHook(
			({ task }) => useTaskForm({ task }),
			{ initialProps: { task: undefined as Task | undefined } },
		);

		expect(result.current.getValues().title).toBe("");

		rerender({ task: mockTask });

		const values = result.current.getValues();
		expect(values.title).toBe("Test Task");
		expect(values.description).toBe("Test Description");
		expect(values.assignee).toBe("John Doe");
		expect(values.completed).toBe(false);
	});

	it("handles task prop change from one task to another", () => {
		const { result, rerender } = renderHook(
			({ task }) => useTaskForm({ task }),
			{ initialProps: { task: mockTask } },
		);

		expect(result.current.getValues().title).toBe("Test Task");

		const newTask: Task = {
			...mockTask,
			id: "2",
			title: "Updated Task",
			description: "Updated Description",
			assignee: "Jane Smith",
			completed: true,
		};

		rerender({ task: newTask });

		const values = result.current.getValues();
		expect(values.title).toBe("Updated Task");
		expect(values.description).toBe("Updated Description");
		expect(values.assignee).toBe("Jane Smith");
		expect(values.completed).toBe(true);
	});

	it("provides form validation through formState", () => {
		const { result } = renderHook(() => useTaskForm());

		expect(result.current.formState).toBeDefined();
		expect(result.current.formState.errors).toBeDefined();
		expect(result.current.formState.isValid).toBeDefined();
	});

	it("provides control for form fields", () => {
		const { result } = renderHook(() => useTaskForm());

		expect(result.current.control).toBeDefined();
	});

	it("provides handleSubmit function", () => {
		const { result } = renderHook(() => useTaskForm());

		expect(typeof result.current.handleSubmit).toBe("function");
	});
});
