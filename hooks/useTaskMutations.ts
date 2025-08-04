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
import { compareTasks } from "../utils/sort";

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
		} catch (error) {
			console.error("Error cancelling queries:", error);
		}
	};

	const invalidateQueries = (taskId?: string) => {
		try {
			queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
			queryClient.invalidateQueries({
				queryKey: ["tasks", "infinite"],
				exact: false,
			});
			if (taskId) {
				queryClient.invalidateQueries({ queryKey: ["task", taskId] });
			}
		} catch (error) {
			console.error("Error invalidating queries:", error);
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

				// Update all infinite query caches
				previousInfiniteQueries.forEach(({ queryKey, data }) => {
					if (data?.pages) {
						const updatedPages = data.pages.map((p, idx: number) => {
							if (idx === 0) {
								const sortedData = [optimisticTask, ...p.data].sort(
									compareTasks,
								);
								return { ...p, data: sortedData };
							}
							return p;
						});
						queryClient.setQueryData(queryKey, {
							...data,
							pages: updatedPages,
						});
					}
				});

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
			// Update caches with the server response instead of invalidating
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

			// Update infinite query caches
			const allQueries = queryClient
				.getQueryCache()
				.findAll({ queryKey: ["tasks", "infinite"], exact: false });

			allQueries.forEach((query) => {
				const data = query.state.data as InfiniteTaskData;
				if (data?.pages) {
					const updatedPages = data.pages.map((p, idx: number) => {
						if (idx === 0) {
							const tasksWithoutOptimistic = p.data.filter(
								(t) => !t.id.startsWith("optimistic-"),
							);
							const sortedData = [newTask, ...tasksWithoutOptimistic].sort(
								compareTasks,
							);
							return { ...p, data: sortedData };
						}
						return p;
					});
					queryClient.setQueryData(query.queryKey, {
						...data,
						pages: updatedPages,
					});
				}
			});

			router.back();
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

				previousInfiniteQueries.forEach(({ queryKey, data: infiniteData }) => {
					if (infiniteData?.pages) {
						queryClient.setQueryData(queryKey, {
							...infiniteData,
							pages: infiniteData.pages.map((p) => ({
								...p,
								data: p.data.map((t: Task) =>
									t.id === id ? { ...t, ...data } : t,
								),
							})),
						});
					}
				});

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
