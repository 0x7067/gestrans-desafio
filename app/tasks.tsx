import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { taskApi } from "../services/api";
import type { Task } from "../types/Task";

export default function TaskListScreen() {
	const router = useRouter();

	const { data: tasks = [], isLoading, error, refetch } = useQuery({
		queryKey: ['tasks'],
		queryFn: taskApi.getAll,
	});

	if (isLoading) {
		return (
			<SafeAreaView style={[styles.container, styles.centered]}>
				<ActivityIndicator size="large" color="#007AFF" />
			</SafeAreaView>
		);
	}

	if (error) {
		return (
			<SafeAreaView style={[styles.container, styles.centered]}>
				<Text style={styles.errorText}>Error loading tasks</Text>
				<TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
					<Text style={styles.retryButtonText}>Retry</Text>
				</TouchableOpacity>
			</SafeAreaView>
		);
	}

	const renderTask = ({ item }: { item: Task }) => (
		<TouchableOpacity
			style={styles.taskItem}
			onPress={() => router.push(`/task-form?id=${item.id}`)}
		>
			<View style={styles.taskContent}>
				<Text
					style={[styles.taskTitle, item.completed && styles.completedTask]}
				>
					{item.title}
				</Text>
				<Text style={styles.taskDescription} numberOfLines={2}>
					{item.description}
				</Text>
				<View style={styles.taskMeta}>
					<Text style={styles.assignee}>Assigned to: {item.assignee}</Text>
					<Text style={styles.createdDate}>
						{new Date(item.createdAt).toLocaleDateString()}
					</Text>
				</View>
			</View>
			<View
				style={[
					styles.statusIndicator,
					item.completed && styles.completedIndicator,
				]}
			/>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
			<View style={styles.header}>
				<Text style={styles.title}>Tasks</Text>
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => router.push("/task-form")}
				>
					<Text style={styles.addButtonText}>+</Text>
				</TouchableOpacity>
			</View>

			<FlatList
				data={tasks}
				renderItem={renderTask}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContainer}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={isLoading} onRefresh={refetch} />
				}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 15,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
	},
	addButton: {
		backgroundColor: "#007AFF",
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	addButtonText: {
		color: "#fff",
		fontSize: 24,
		fontWeight: "bold",
	},
	listContainer: {
		padding: 20,
	},
	centered: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	errorText: {
		fontSize: 16,
		color: '#ff3b30',
		marginBottom: 20,
	},
	retryButton: {
		backgroundColor: '#007AFF',
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 8,
	},
	retryButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	taskItem: {
		flexDirection: "row",
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 15,
		marginBottom: 10,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	taskContent: {
		flex: 1,
	},
	taskTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 4,
	},
	taskDescription: {
		fontSize: 14,
		color: "#666",
	},
	completedTask: {
		textDecorationLine: "line-through",
		color: "#999",
	},
	statusIndicator: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: "#ff9500",
		marginLeft: 10,
	},
	completedIndicator: {
		backgroundColor: "#34c759",
	},
	taskMeta: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 8,
	},
	assignee: {
		fontSize: 12,
		color: "#007AFF",
		fontWeight: "500",
	},
	createdDate: {
		fontSize: 12,
		color: "#999",
	},
});
