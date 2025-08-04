import {
	type InfiniteData,
	type UseMutationResult,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { taskApi, type PaginatedResponse } from "../services/api";
import type { Task } from "../types/Task";
import { handleMutationError } from "../utils/errorHandling";
import { compareTasks } from "../utils/sort";

type InfiniteTaskData = InfiniteData<PaginatedResponse<Task>>;

type CreateTaskDTO = Omit<Task, "id" | "createdAt">;

type UpdateTaskDTO = Partial<Omit<Task, "id" | "createdAt">> & {
	completed?: boolean;
};

export interface UseTaskMutationsReturn {
	createMutation: UseMutationResult<Task, Error, CreateTaskDTO, unknown>;
	updateMutation: UseMutationResult<
		Task,
		Error,
		{ id: string; data: UpdateTaskDTO },
		unknown
	>;
	deleteMutation: UseMutationResult<void, Error, string, unknown>;
	handleSave: (
		data: CreateTaskDTO | UpdateTaskDTO,
		isEditing: boolean,
		id?: string,
	) => void;
	handleDelete: (id: string) => void;
}

export function useTaskMutations(): UseTaskMutationsReturn {
	const router = useRouter();
	const queryClient = useQueryClient();

	const cancelQueries = async (taskId?: string) => {
		try {
			await Promise.all([
				queryClient.cancelQueries({ queryKey: ["tasks"], exact: false }),
				queryClient.cancelQueries({
					queryKey: ["tasks", "infinite"],
					exact: false,
				}),
				...(taskId
					? [queryClient.cancelQueries({ queryKey: ["task", taskId] })]
					: []),
			]);
		} catch (error) {}
	};

	const invalidateQueries = (taskId?: string) => {
		queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
		queryClient.invalidateQueries({
			queryKey: ["tasks", "infinite"],
			exact: false,
		});
		if (taskId) {
			queryClient.invalidateQueries({ queryKey: ["task", taskId] });
		}
	};

	const createMutation = useMutation({
		mutationFn: taskApi.create,
		onMutate: async (newTask) => {
			try {
				await cancelQueries();

				const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

				const allQueries = queryClient
					.getQueryCache()
					.findAll({ queryKey: ["tasks", "infinite"], exact: false });
				const previousInfiniteQueries = allQueries.map((query) => ({
					queryKey: query.queryKey,
					data: query.state.data as InfiniteTaskData,
				}));

				const optimisticTask: Task = {
					...newTask,
					id: `optimistic-${Date.now()}`,
					createdAt: new Date().toISOString(),
				};

				if (previousTasks) {
					const sortedTasks = [optimisticTask, ...previousTasks].sort(
						compareTasks,
					);
					queryClient.setQueryData<Task[]>(["tasks"], sortedTasks);
				}

				queryClient.setQueriesData(
					{ queryKey: ["tasks", "infinite"], exact: false },
					(old: InfiniteTaskData | undefined) => {
						if (!old?.pages) return old;
						return {
							...old,
							pages: old.pages.map((p, idx: number) =>
								idx === 0
									? {
											...p,
											data: [optimisticTask, ...p.data].sort(compareTasks),
										}
									: p,
							),
						};
					},
				);

				return { previousTasks, previousInfiniteQueries } as const;
			} catch (error) {
				console.error("Error during optimistic update:", error);
				return { previousTasks: null, previousInfiniteQueries: [] };
			}
		},
		onError: (error, _variables, context) => {
			if (context?.previousTasks) {
				queryClient.setQueryData(["tasks"], context.previousTasks);
			}
			if (context?.previousInfiniteQueries) {
				context.previousInfiniteQueries.forEach(({ queryKey, data }) => {
					queryClient.setQueryData(queryKey, data);
				});
			}
			handleMutationError(error, "Failed to create task. Please try again.");
		},
		onSuccess: (newTask) => {
			const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);
			if (previousTasks) {
				const tasksWithoutOptimistic = previousTasks.filter(
					(t) => !t.id.startsWith("optimistic-"),
				);
				const sortedTasks = [newTask, ...tasksWithoutOptimistic].sort(
					compareTasks,
				);
				queryClient.setQueryData<Task[]>(["tasks"], sortedTasks);
			}
			router.back();
		},
		onSettled: () => {
			invalidateQueries();
		},
		retry: 2,
		retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
			taskApi.update(id, data),
		onMutate: async ({ id, data }) => {
			try {
				await cancelQueries(id);

				const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);
				const allQueries = queryClient
					.getQueryCache()
					.findAll({ queryKey: ["tasks", "infinite"], exact: false });
				const previousInfiniteQueries = allQueries.map((query) => ({
					queryKey: query.queryKey,
					data: query.state.data as InfiniteTaskData,
				}));
				const previousTask = queryClient.getQueryData<Task>(["task", id]);

				if (previousTasks) {
					queryClient.setQueryData<Task[]>(
						["tasks"],
						previousTasks.map((t) =>
							t.id === id ? ({ ...t, ...data } as Task) : t,
						),
					);
				}

				queryClient.setQueriesData(
					{ queryKey: ["tasks", "infinite"], exact: false },
					(old: InfiniteTaskData | undefined) => {
						if (!old?.pages) return old;
						return {
							...old,
							pages: old.pages.map((p) => ({
								...p,
								data: p.data.map((t: Task) =>
									t.id === id ? { ...t, ...data } : t,
								),
							})),
						};
					},
				);

				if (previousTask) {
					queryClient.setQueryData<Task>(["task", id], {
						...previousTask,
						...data,
					});
				}

				return {
					previousTasks,
					previousInfiniteQueries,
					previousTask,
				} as const;
			} catch (error) {
				console.error("Error during optimistic update:", error);
				return {
					previousTasks: null,
					previousInfiniteQueries: [],
					previousTask: null,
				};
			}
		},
		onError: (error, variables, context) => {
			if (context?.previousTasks) {
				queryClient.setQueryData(["tasks"], context.previousTasks);
			}
			if (context?.previousInfiniteQueries) {
				context.previousInfiniteQueries.forEach(({ queryKey, data }) => {
					queryClient.setQueryData(queryKey, data);
				});
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
			try {
				await cancelQueries(id);

				const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);
				const allQueries = queryClient
					.getQueryCache()
					.findAll({ queryKey: ["tasks", "infinite"], exact: false });
				const previousInfiniteQueries = allQueries.map((query) => ({
					queryKey: query.queryKey,
					data: query.state.data as InfiniteTaskData,
				}));
				const previousTask = queryClient.getQueryData<Task>(["task", id]);

				if (previousTasks) {
					queryClient.setQueryData<Task[]>(
						["tasks"],
						previousTasks.filter((t) => t.id !== id),
					);
				}

				previousInfiniteQueries.forEach(({ queryKey, data }) => {
					if (data?.pages) {
						queryClient.setQueryData(queryKey, {
							...data,
							pages: data.pages.map((p) => ({
								...p,
								data: p.data.filter((t: Task) => t.id !== id),
							})),
						});
					}
				});

				return {
					previousTasks,
					previousInfiniteQueries,
					previousTask,
				} as const;
			} catch (error) {
				console.error("Error during optimistic update:", error);
				return {
					previousTasks: null,
					previousInfiniteQueries: [],
					previousTask: null,
				};
			}
		},
		onError: (error, id, context) => {
			if (context?.previousTasks) {
				queryClient.setQueryData(["tasks"], context.previousTasks);
			}
			if (context?.previousInfiniteQueries) {
				context.previousInfiniteQueries.forEach(({ queryKey, data }) => {
					queryClient.setQueryData(queryKey, data);
				});
			}
			if (context?.previousTask) {
				queryClient.setQueryData(["task", id], context.previousTask);
			}
			handleMutationError(error, "Failed to delete task. Please try again.");
		},
		onSettled: (_data, _error, id) => {
			invalidateQueries(id);
		},
		onSuccess: () => {
			router.back();
		},
		retry: 2,
		retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
	});

	const handleSave = (
		data: CreateTaskDTO | UpdateTaskDTO,
		isEditing: boolean,
		id?: string,
	) => {
		if (isEditing && id) {
			updateMutation.mutate({ id, data: data as UpdateTaskDTO });
		} else {
			createMutation.mutate(data as CreateTaskDTO);
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
