import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
	Button,
	Dropdown,
	LoadingIndicator,
	StatusIndicator,
	TaskItem,
} from "@/components";
import { FILTER_OPTIONS, type FilterStatus, PAGINATION } from "@/constants";
import { Colors } from "@/styles/colors";
import { Dimensions } from "@/styles/dimensions";
import { useInfiniteTaskList } from "../hooks/useInfiniteTaskList";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import type { Task } from "../types/Task";
import { compareTasks } from "../utils/sort";

export default function TaskListScreen() {
	const router = useRouter();
	const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

	const {
		tasks: tasksData,
		isLoading,
		error,
		status,
		isFetching,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		refetch,
	} = useInfiniteTaskList({ pageSize: PAGINATION.DEFAULT_PAGE_SIZE });

	const {
		isOnline,
		connectionType,
		isLoading: isNetworkLoading,
		error: networkError,
	} = useNetworkStatus();

	const tasks = useMemo(() => {
		return tasksData
			.filter((task) => {
				if (filterStatus === "completed") return task.completed;
				if (filterStatus === "incomplete") return !task.completed;
				return true;
			})
			.sort(compareTasks);
	}, [tasksData, filterStatus]);

	const handleLoadMore = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const handleTaskPress = useCallback(
		(task: Task) => {
			router.push(`/task-form?id=${task.id}`);
		},
		[router],
	);

	const renderTask = useCallback(
		({ item }: { item: Task }) => (
			<TaskItem task={item} onPress={handleTaskPress} />
		),
		[handleTaskPress],
	);

	const keyExtractor = useCallback((item: Task) => item.id, []);

	// Show loading state while checking network status
	if (isNetworkLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<LoadingIndicator isFullScreen message="Checking network status..." />
			</SafeAreaView>
		);
	}

	// Show error state if network status check failed
	if (networkError) {
		return (
			<SafeAreaView style={[styles.container, styles.centered]}>
				<Text style={styles.errorText}>
					Network status unavailable: {networkError.message}
				</Text>
				<Button title="Retry" variant="primary" onPress={() => refetch()} />
			</SafeAreaView>
		);
	}

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<LoadingIndicator isFullScreen />
			</SafeAreaView>
		);
	}

	if (status === "error") {
		return (
			<SafeAreaView style={[styles.container, styles.centered]}>
				<Text style={styles.errorText}>
					{error instanceof Error ? error.message : "Error loading tasks"}
				</Text>
				<Button title="Retry" variant="primary" onPress={() => refetch()} />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView
			style={styles.container}
			edges={["top", "left", "right"]}
			testID="task-list-screen"
		>
			<View style={styles.header}>
				<View style={styles.headerLeft}>
					<Text style={styles.title}>Tasks</Text>
					<StatusIndicator
						status={isOnline ? "online" : "offline"}
						label={isOnline ? `Online (${connectionType})` : "Offline"}
						variant="badge"
					/>
				</View>
				<TouchableOpacity
					testID="add-task-button"
					accessibilityRole="button"
					accessibilityLabel="Add task"
					importantForAccessibility="yes"
					style={styles.addButton}
					onPress={() => router.push("/task-form")}
				>
					<Text style={styles.addButtonText}>+</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.filterContainer}>
				<Text style={styles.filterLabel}>Filter by status:</Text>
				<Dropdown
					testID="status-filter"
					options={FILTER_OPTIONS}
					value={filterStatus}
					onChange={(value) => setFilterStatus(value as FilterStatus)}
					style={styles.dropdown}
				/>
			</View>

			<FlatList
				testID="task-list"
				data={tasks}
				renderItem={renderTask}
				keyExtractor={keyExtractor}
				contentContainerStyle={[styles.listContainer, { paddingBottom: 100 }]}
				showsVerticalScrollIndicator={false}
				initialNumToRender={6}
				maxToRenderPerBatch={3}
				windowSize={3}
				removeClippedSubviews={true}
				updateCellsBatchingPeriod={50}
				refreshControl={
					<RefreshControl
						testID="task-list-refresh"
						refreshing={isFetching && !isFetchingNextPage}
						onRefresh={refetch}
						colors={[Colors.primary]}
						tintColor={Colors.primary}
					/>
				}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.5}
				ListFooterComponent={() => {
					if (isFetchingNextPage) {
						return (
							<View
								style={styles.footerLoader}
								testID="task-list-footer-loading"
							>
								<ActivityIndicator
									size="small"
									color={Colors.primary}
									testID="task-list-footer-activity"
								/>
								<Text style={styles.footerText}>Loading more tasks...</Text>
							</View>
						);
					}

					if (!hasNextPage && tasks.length > 0) {
						return (
							<View style={styles.footerEnd} testID="task-list-footer">
								<Text style={styles.footerText}>No more tasks to load</Text>
							</View>
						);
					}

					return null;
				}}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.backgroundGray,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: Dimensions.spacing.xxl,
		paddingVertical: Dimensions.header.paddingVertical,
		backgroundColor: Colors.surface,
		borderBottomWidth: 0,
		shadowColor: Colors.shadowSecondary,
		shadowOffset: Dimensions.shadow.small.shadowOffset,
		shadowOpacity: 0.1,
		shadowRadius: Dimensions.shadow.small.shadowRadius,
		elevation: Dimensions.shadow.small.elevation,
	},
	headerLeft: {
		flex: 1,
		gap: Dimensions.spacing.md,
	},
	title: {
		fontSize: Dimensions.fontSize.xxl,
		fontWeight: "800",
		color: Colors.textPrimary,
		letterSpacing: Dimensions.header.titleLetterSpacing,
	},
	addButton: {
		minWidth: 44,
		minHeight: 44,
		backgroundColor: Colors.primary,
		width: Dimensions.button.fab.width,
		height: Dimensions.button.fab.height,
		borderRadius: Dimensions.button.fab.borderRadius,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: Colors.shadowPrimary,
		shadowOffset: Dimensions.shadow.floating.shadowOffset,
		shadowOpacity: Dimensions.shadow.floating.shadowOpacity,
		shadowRadius: Dimensions.shadow.floating.shadowRadius,
		elevation: Dimensions.shadow.floating.elevation,
	},
	addButtonText: {
		color: Colors.white,
		fontSize: Dimensions.fontSize.xl + 4,
		fontWeight: "300",
		lineHeight: Dimensions.fontSize.xl + 4,
	},
	listContainer: {
		padding: Dimensions.spacing.xxl,
	},
	centered: {
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		fontSize: Dimensions.fontSize.md,
		color: Colors.error,
		marginBottom: Dimensions.spacing.xxl,
	},
	filterContainer: {
		backgroundColor: Colors.surface,
		paddingHorizontal: Dimensions.spacing.xxl,
		paddingVertical: Dimensions.spacing.lg + Dimensions.spacing.sm,
		borderBottomWidth: 0,
		flexDirection: "row",
		alignItems: "center",
		zIndex: Dimensions.zIndex.dropdown,
		marginBottom: Dimensions.spacing.sm,
	},
	filterLabel: {
		fontSize: Dimensions.fontSize.md,
		color: Colors.textSecondary,
		marginRight: Dimensions.spacing.xl,
		fontWeight: "600",
	},
	dropdown: {
		flex: 1,
	},
	footerLoader: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: Dimensions.spacing.xxl,
		gap: Dimensions.spacing.md,
	},
	footerEnd: {
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: Dimensions.spacing.xxl,
	},
	footerText: {
		fontSize: Dimensions.fontSize.sm,
		color: Colors.lightGray,
	},
});
