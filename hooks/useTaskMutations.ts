import {
	type InfiniteData,
	type UseMutationResult,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { taskApi, type PaginatedResponse } from "../services/api";
import type { Task } from "../types/Task";
import { handleMutationError } from "../utils/errorHandling";

type InfiniteTaskData = InfiniteData<PaginatedResponse<Task>>;

export interface UseTaskMutationsReturn {
	createMutation: UseMutationResult<
		Task,
		Error,
		Omit<Task, "id" | "createdAt">,
		unknown
	>;
	updateMutation: UseMutationResult<
		Task,
		Error,
		{ id: string; data: Partial<Task> },
		unknown
	>;
	deleteMutation: UseMutationResult<void, Error, string, unknown>;
	handleSave: (data: Partial<Task>, isEditing: boolean, id?: string) => void;
	handleDelete: (id: string) => void;
}

export function useTaskMutations(): UseTaskMutationsReturn {
	const router = useRouter();
	const queryClient = useQueryClient();

	const cancelQueries = async (taskId?: string) => {
		await queryClient.cancelQueries({ queryKey: ["tasks"] });
		await queryClient.cancelQueries({ queryKey: ["tasks", "infinite"] });
		if (taskId) {
			await queryClient.cancelQueries({ queryKey: ["task", taskId] });
		}
	};

	const invalidateQueries = (taskId?: string) => {
		queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
		if (taskId) {
			queryClient.invalidateQueries({ queryKey: ["task", taskId] });
		}
	};

	const createMutation = useMutation({
		mutationFn: taskApi.create,
		onMutate: async (newTask) => {
			await cancelQueries();

			const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);
			const previousInfinite = queryClient.getQueryData<InfiniteTaskData>([
				"tasks",
				"infinite",
			]);

			const optimisticTask: Task = {
				...newTask,
				id: `optimistic-${Date.now()}`,
				createdAt: new Date().toISOString(),
			};

			if (previousTasks) {
				queryClient.setQueryData<Task[]>(
					["tasks"],
					[optimisticTask, ...previousTasks],
				);
			}

			if (previousInfinite?.pages) {
				queryClient.setQueryData(["tasks", "infinite"], {
					...previousInfinite,
					pages: previousInfinite.pages.map((p, idx: number) =>
						idx === 0 ? { ...p, data: [optimisticTask, ...p.data] } : p,
					),
				});
			}

			return { previousTasks, previousInfinite } as const;
		},
		onError: (error, _variables, context) => {
			if (context?.previousTasks) {
				queryClient.setQueryData(["tasks"], context.previousTasks);
			}
			if (context?.previousInfinite) {
				queryClient.setQueryData(
					["tasks", "infinite"],
					context.previousInfinite,
				);
			}
			handleMutationError(error, "Failed to create task. Please try again.");
		},
		onSettled: () => {
			invalidateQueries();
		},
		onSuccess: () => {
			router.back();
		},
		retry: 2,
		retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
			taskApi.update(id, data),
		onMutate: async ({ id, data }) => {
			await cancelQueries(id);

			const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);
			const previousInfinite = queryClient.getQueryData<InfiniteTaskData>([
				"tasks",
				"infinite",
			]);
			const previousTask = queryClient.getQueryData<Task>(["task", id]);

			if (previousTasks) {
				queryClient.setQueryData<Task[]>(
					["tasks"],
					previousTasks.map((t) =>
						t.id === id ? ({ ...t, ...data } as Task) : t,
					),
				);
			}

			if (previousInfinite?.pages) {
				queryClient.setQueryData(["tasks", "infinite"], {
					...previousInfinite,
					pages: previousInfinite.pages.map((p) => ({
						...p,
						data: p.data.map((t: Task) =>
							t.id === id ? { ...t, ...data } : t,
						),
					})),
				});
			}

			if (previousTask) {
				queryClient.setQueryData<Task>(["task", id], {
					...previousTask,
					...data,
				});
			}

			return { previousTasks, previousInfinite, previousTask } as const;
		},
		onError: (error, variables, context) => {
			if (context?.previousTasks) {
				queryClient.setQueryData(["tasks"], context.previousTasks);
			}
			if (context?.previousInfinite) {
				queryClient.setQueryData(
					["tasks", "infinite"],
					context.previousInfinite,
				);
			}
			if (context?.previousTask) {
				queryClient.setQueryData(["task", variables.id], context.previousTask);
			}
			handleMutationError(error, "Failed to update task. Please try again.");
		},
		onSettled: (_data, _error, { id }) => {
			invalidateQueries(id);
		},
		onSuccess: () => {
			router.back();
		},
		retry: 2,
		retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
	});

	const deleteMutation = useMutation({
		mutationFn: taskApi.delete,
		onMutate: async (id) => {
			await cancelQueries(id);

			const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);
			const previousInfinite = queryClient.getQueryData<InfiniteTaskData>([
				"tasks",
				"infinite",
			]);
			const previousTask = queryClient.getQueryData<Task>(["task", id]);

			if (previousTasks) {
				queryClient.setQueryData<Task[]>(
					["tasks"],
					previousTasks.filter((t) => t.id !== id),
				);
			}

			if (previousInfinite?.pages) {
				queryClient.setQueryData(["tasks", "infinite"], {
					...previousInfinite,
					pages: previousInfinite.pages.map((p) => ({
						...p,
						data: p.data.filter((t: Task) => t.id !== id),
					})),
				});
			}

			return { previousTasks, previousInfinite, previousTask } as const;
		},
		onError: (error, id, context) => {
			if (context?.previousTasks) {
				queryClient.setQueryData(["tasks"], context.previousTasks);
			}
			if (context?.previousInfinite) {
				queryClient.setQueryData(
					["tasks", "infinite"],
					context.previousInfinite,
				);
			}
			if (context?.previousTask) {
				queryClient.setQueryData(["task", id], context.previousTask);
			}
			handleMutationError(error, "Failed to delete task. Please try again.");
		},
		onSettled: () => {
			invalidateQueries();
		},
		onSuccess: () => {
			router.back();
		},
		retry: 2,
		retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
	});

	const handleSave = (data: Partial<Task>, isEditing: boolean, id?: string) => {
		if (isEditing && id) {
			updateMutation.mutate({ id, data });
		} else {
			const createData = data as Omit<Task, "id" | "createdAt">;
			createMutation.mutate(createData);
		}
	};

	const handleDelete = (id: string) => {
		Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => {
					deleteMutation.mutate(id);
				},
			},
		]);
	};

	return {
		createMutation,
		updateMutation,
		deleteMutation,
		handleSave,
		handleDelete,
	};
}
