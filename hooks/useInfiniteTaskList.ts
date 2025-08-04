import { useInfiniteQuery } from "@tanstack/react-query";
import { FIVE_MINUTES } from "@/constants/time";
import { taskApi } from "../services/api";
import type { Task } from "../types/Task";

interface UseInfiniteTaskListOptions {
	pageSize?: number;
}

export function useInfiniteTaskList({
	pageSize = 10,
}: UseInfiniteTaskListOptions = {}) {
	const {
		data,
		error,
		fetchNextPage,
		hasNextPage,
		isFetching,
		isFetchingNextPage,
		isLoading,
		refetch,
		status,
	} = useInfiniteQuery({
		queryKey: ["tasks", "infinite", pageSize],
		queryFn: ({ pageParam = 1 }) =>
			taskApi.getPaginated({ page: pageParam, limit: pageSize }),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			return lastPage.hasMore ? lastPage.page + 1 : undefined;
		},
		staleTime: FIVE_MINUTES,
		refetchOnWindowFocus: false,
	});

	// Flatten all pages into a single array of tasks
	const tasks: Task[] = data?.pages.flatMap((page) => page.data) ?? [];

	return {
		tasks,
		data,
		error,
		status,
		isLoading,
		isFetching,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		refetch,
	};
}
