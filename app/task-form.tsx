import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { taskApi } from "../services/api";
import type { Task } from "../types/Task";

export default function TaskFormScreen() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { id } = useLocalSearchParams();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [completed, setCompleted] = useState(false);
	const [assignee, setAssignee] = useState("");

	const isEditing = Boolean(id);

	const { data: task, isLoading } = useQuery({
		queryKey: ["task", id],
		queryFn: () => taskApi.getById(id as string),
		enabled: isEditing,
	});

	const createMutation = useMutation({
		mutationFn: taskApi.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			router.back();
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
			taskApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			queryClient.invalidateQueries({ queryKey: ["task", id] });
			router.back();
		},
	});

	const deleteMutation = useMutation({
		mutationFn: taskApi.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			router.back();
		},
	});

	useEffect(() => {
		if (task) {
			setTitle(task.title);
			setDescription(task.description);
			setCompleted(task.completed);
			setAssignee(task.assignee);
		}
	}, [task]);

	if (isLoading) {
		return (
			<SafeAreaView style={[styles.safeArea, styles.centered]}>
				<ActivityIndicator size="large" color="#007AFF" />
			</SafeAreaView>
		);
	}

	const handleSave = () => {
		if (!title.trim()) {
			Alert.alert("Error", "Please enter a task title");
			return;
		}

		if (!assignee.trim()) {
			Alert.alert("Error", "Please enter an assignee");
			return;
		}

		const taskData = {
			title: title.trim(),
			description: description.trim(),
			completed,
			assignee: assignee.trim(),
		};

		if (isEditing) {
			updateMutation.mutate({ id: id as string, data: taskData });
		} else {
			createMutation.mutate(taskData);
		}
	};

	const handleDelete = () => {
		Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => {
					deleteMutation.mutate(id as string);
				},
			},
		]);
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
			<ScrollView
				style={styles.container}
				contentContainerStyle={styles.contentContainer}
			>
				<View style={styles.form}>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Title *</Text>
						<TextInput
							style={styles.textInput}
							value={title}
							onChangeText={setTitle}
							placeholder="Enter task title"
							placeholderTextColor="#999"
						/>
					</View>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Description</Text>
						<TextInput
							style={[styles.textInput, styles.textArea]}
							value={description}
							onChangeText={setDescription}
							placeholder="Enter task description"
							placeholderTextColor="#999"
							multiline
							numberOfLines={4}
							textAlignVertical="top"
						/>
					</View>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Assignee *</Text>
						<TextInput
							style={styles.textInput}
							value={assignee}
							onChangeText={setAssignee}
							placeholder="Enter assignee name"
							placeholderTextColor="#999"
						/>
					</View>
					{isEditing && (
						<View style={styles.inputGroup}>
							<View style={styles.switchContainer}>
								<Text style={styles.label}>Completed</Text>
								<Switch
									value={completed}
									onValueChange={setCompleted}
									trackColor={{ false: "#e0e0e0", true: "#34c759" }}
									thumbColor={completed ? "#fff" : "#f4f3f4"}
								/>
							</View>
						</View>
					)}
					<TouchableOpacity
						style={[
							styles.saveButton,
							(createMutation.isPending || updateMutation.isPending) &&
								styles.disabledButton,
						]}
						onPress={handleSave}
						disabled={createMutation.isPending || updateMutation.isPending}
					>
						<Text style={styles.saveButtonText}>
							{createMutation.isPending || updateMutation.isPending
								? "Saving..."
								: isEditing
									? "Update Task"
									: "Create Task"}
						</Text>
					</TouchableOpacity>
					{isEditing && (
						<TouchableOpacity
							style={[
								styles.deleteButton,
								deleteMutation.isPending && styles.disabledButton,
							]}
							onPress={handleDelete}
							disabled={deleteMutation.isPending}
						>
							<Text style={styles.deleteButtonText}>
								{deleteMutation.isPending ? "Deleting..." : "Delete Task"}
							</Text>
						</TouchableOpacity>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	contentContainer: {
		flexGrow: 1,
	},
	form: {
		padding: 20,
	},
	inputGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
	},
	textInput: {
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 15,
		fontSize: 16,
		borderWidth: 1,
		borderColor: "#e0e0e0",
		color: "#333",
	},
	textArea: {
		height: 100,
		paddingTop: 15,
	},
	switchContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 15,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	saveButton: {
		backgroundColor: "#007AFF",
		borderRadius: 10,
		padding: 15,
		alignItems: "center",
		marginTop: 10,
	},
	saveButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	deleteButton: {
		backgroundColor: "#ff3b30",
		borderRadius: 10,
		padding: 15,
		alignItems: "center",
		marginTop: 10,
	},
	deleteButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	centered: {
		justifyContent: "center",
		alignItems: "center",
	},
	disabledButton: {
		opacity: 0.6,
	},
});
