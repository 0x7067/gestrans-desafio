import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { Controller } from "react-hook-form";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Input, LoadingIndicator } from "@/components";
import { FIELD_LIMITS } from "@/constants";
import { Colors } from "@/styles/colors";
import { Dimensions } from "@/styles/dimensions";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useTaskForm } from "../hooks/useTaskForm";
import { useTaskMutations } from "../hooks/useTaskMutations";
import { taskApi } from "../services/api";

export default function TaskFormScreen() {
	const { id } = useLocalSearchParams();
	const isEditing = Boolean(id);

	const { data: task, isLoading } = useQuery({
		queryKey: ["task", id],
		queryFn: () => taskApi.getById(id as string),
		enabled: isEditing,
	});

	const form = useTaskForm({ task });
	const { control, handleSubmit, formState } = form;
	const { errors, isSubmitted } = formState;

	const {
		createMutation,
		updateMutation,
		deleteMutation,
		handleSave,
		handleDelete,
	} = useTaskMutations();

	const { isOnline } = useNetworkStatus();

	const onSubmit = useCallback(
		(data: Parameters<typeof handleSave>[0]) => {
			try {
				const formData = {
					title: data.title?.trim() || "",
					description: data.description?.trim() || "",
					assignee: data.assignee?.trim() || "",
					completed: data.completed || false,
				};
				handleSave(formData, isEditing, id as string);
			} catch (error) {
				console.error("Form submission error:", error);
			}
		},
		[handleSave, isEditing, id],
	);

	const handleDeletePress = useCallback(() => {
		handleDelete(id as string);
	}, [handleDelete, id]);

	if (isLoading) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<LoadingIndicator isFullScreen message="Loading task..." />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
			{!isOnline && (
				<View style={styles.offlineBanner}>
					<Text style={styles.offlineBannerText}>
						You&apos;re offline. Changes will be retried when you reconnect.
					</Text>
				</View>
			)}
			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<ScrollView
					style={styles.container}
					contentContainerStyle={styles.contentContainer}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.form}>
						{(createMutation.error ||
							updateMutation.error ||
							deleteMutation.error) && (
							<View style={styles.errorContainer}>
								<Text style={styles.errorText}>
									{createMutation.error?.message ||
										updateMutation.error?.message ||
										deleteMutation.error?.message}
								</Text>
							</View>
						)}
						<Controller
							control={control}
							name="title"
							render={({ field: { onChange, onBlur, value } }) => (
								<Input
									label="Title"
									required
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									placeholder="Enter task title"
									accessibilityLabel="Task title"
									testID="title-input"
									returnKeyType="next"
									maxLength={FIELD_LIMITS.TITLE_MAX_LENGTH}
									error={
										isSubmitted && errors.title
											? errors.title.message
											: undefined
									}
								/>
							)}
						/>
						<Controller
							control={control}
							name="description"
							render={({ field: { onChange, onBlur, value } }) => (
								<Input
									label="Description"
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									placeholder="Enter task description"
									multiline
									accessibilityLabel="Task description"
									testID="description-input"
									maxLength={FIELD_LIMITS.DESCRIPTION_MAX_LENGTH}
									error={
										isSubmitted && errors.description
											? errors.description.message
											: undefined
									}
								/>
							)}
						/>
						<Controller
							control={control}
							name="assignee"
							render={({ field: { onChange, onBlur, value } }) => (
								<Input
									label="Assignee"
									required
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									placeholder="Enter assignee name"
									accessibilityLabel="Task assignee"
									testID="assignee-input"
									returnKeyType="done"
									maxLength={FIELD_LIMITS.ASSIGNEE_MAX_LENGTH}
									error={
										isSubmitted && errors.assignee
											? errors.assignee.message
											: undefined
									}
								/>
							)}
						/>
						{isEditing && (
							<View style={styles.inputGroup}>
								<View style={styles.switchContainer}>
									<Text style={styles.label}>Completed</Text>
									<Controller
										control={control}
										name="completed"
										render={({ field: { onChange, value } }) => (
											<Switch
												value={value}
												onValueChange={onChange}
												trackColor={{
													false: Colors.borderGray,
													true: Colors.success,
												}}
												thumbColor={value ? Colors.white : Colors.paleGray}
												accessibilityLabel="Task completion status"
												testID="completed-switch"
											/>
										)}
									/>
								</View>
							</View>
						)}
						<Button
							title={isEditing ? "Update Task" : "Create Task"}
							variant="primary"
							isLoading={createMutation.isPending || updateMutation.isPending}
							loadingText="Saving..."
							onPress={handleSubmit(onSubmit)}
							accessibilityLabel={isEditing ? "Update task" : "Create task"}
							testID="save-button"
							fullWidth
							style={styles.saveButton}
							disabled={
								!isOnline &&
								(createMutation.isPending || updateMutation.isPending)
							}
						/>
						{isEditing && (
							<Button
								title="Delete Task"
								variant="danger"
								isLoading={deleteMutation.isPending}
								loadingText="Deleting..."
								onPress={handleDeletePress}
								accessibilityLabel="Delete task"
								testID="delete-button"
								fullWidth
								style={styles.deleteButton}
							/>
						)}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
		backgroundColor: Colors.backgroundGray,
	},
	container: {
		flex: 1,
		backgroundColor: Colors.backgroundGray,
	},
	contentContainer: {
		flexGrow: 1,
	},
	form: {
		padding: Dimensions.spacing.xxl,
	},
	inputGroup: {
		marginBottom: Dimensions.spacing.xxl,
	},
	label: {
		fontSize: Dimensions.fontSize.md,
		fontWeight: "600",
		color: Colors.darkGray,
	},
	switchContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: Colors.white,
		borderRadius: Dimensions.borderRadius.lg,
		padding: Dimensions.spacing.xl,
		borderWidth: Dimensions.input.borderWidth,
		borderColor: Colors.borderGray,
	},
	saveButton: {
		marginTop: Dimensions.spacing.md,
	},
	deleteButton: {
		marginTop: Dimensions.spacing.md,
	},
	offlineBanner: {
		backgroundColor: Colors.warning,
		paddingVertical: Dimensions.spacing.sm,
		paddingHorizontal: Dimensions.spacing.xxl,
		alignItems: "center",
	},
	offlineBannerText: {
		color: Colors.white,
		fontSize: Dimensions.fontSize.sm,
		fontWeight: "500",
	},
	errorContainer: {
		backgroundColor: Colors.errorLight || `${Colors.error}20`,
		borderRadius: Dimensions.borderRadius.md,
		padding: Dimensions.spacing.lg,
		marginBottom: Dimensions.spacing.xl,
		borderWidth: 1,
		borderColor: Colors.error,
	},
	errorText: {
		color: Colors.error,
		fontSize: Dimensions.fontSize.sm,
		fontWeight: "500",
		textAlign: "center",
	},
});
