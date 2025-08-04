import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FORM } from "@/constants";
import { Colors } from "@/styles/colors";
import { Dimensions } from "@/styles/dimensions";
import type { Task } from "../../types/Task";
import StatusIndicator from "../StatusIndicator";

interface TaskItemProps {
	task: Task;
	onPress: (task: Task) => void;
}

const TaskItem = React.memo(function TaskItem({ task, onPress }: TaskItemProps) {
	const formattedDate = useMemo(() => {
		return new Date(task.createdAt).toLocaleDateString();
	}, [task.createdAt]);

	const handlePress = useCallback(() => {
		onPress(task);
	}, [onPress, task]);

	const statusIndicatorStatus = useMemo(() => {
		return task.completed ? "completed" : "pending";
	}, [task.completed]);

	const titleStyle = useMemo(() => {
		return [styles.title, task.completed && styles.completedTitle];
	}, [task.completed]);

	return (
		<TouchableOpacity
			accessible
			accessibilityHint="Opens task details"
			accessibilityRole="button"
			accessibilityLabel={`Open task ${task.title}`}
			importantForAccessibility="yes"
			style={styles.container}
			onPress={handlePress}
			testID={`task-item-${task.id}`}
		>
			<View style={styles.content}>
				<Text style={titleStyle}>
					{task.title}
				</Text>
				{task.description && (
					<View style={styles.descriptionWrapper}>
						<Text
							style={styles.description}
							numberOfLines={FORM.DESCRIPTION_PREVIEW_LINES}
						>
							{task.description}
						</Text>
					</View>
				)}
				<View style={styles.meta}>
					<Text style={styles.assignee}>Assigned to: {task.assignee}</Text>
					<Text style={styles.date}>{formattedDate}</Text>
				</View>
			</View>
			<View style={styles.statusContainer}>
				<StatusIndicator
					status={statusIndicatorStatus}
					size="small"
				/>
			</View>
		</TouchableOpacity>
	);
});

export default TaskItem;

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		backgroundColor: Colors.cardBackground,
		borderRadius: Dimensions.borderRadius.xl,
		padding: Dimensions.spacing.xxl,
		marginBottom: Dimensions.spacing.xl,
		alignItems: "flex-start",
		shadowColor: Colors.shadowDark,
		shadowOffset: Dimensions.shadow.card.shadowOffset,
		shadowOpacity: Dimensions.shadow.card.shadowOpacity,
		shadowRadius: Dimensions.shadow.card.shadowRadius,
		elevation: Dimensions.shadow.card.elevation,
		borderWidth: 1,
		borderColor: Colors.lightBorderGray,
	},
	content: {
		flex: 1,
		marginRight: Dimensions.spacing.xl,
		minHeight: 0,
	},
	title: {
		fontSize: Dimensions.fontSize.lg,
		fontWeight: "700",
		color: Colors.textPrimary,
		marginBottom: Dimensions.spacing.sm,
		lineHeight: Dimensions.lineHeight.lg,
	},
	completedTitle: {
		textDecorationLine: "line-through",
		color: Colors.darkGray,
		opacity: 0.7,
	},
	descriptionWrapper: {
		marginBottom: Dimensions.spacing.lg,
		minHeight: Dimensions.lineHeight.sm * FORM.DESCRIPTION_PREVIEW_LINES,
		justifyContent: "flex-start",
		alignItems: "flex-start",
	},
	description: {
		fontSize: Dimensions.fontSize.sm,
		color: Colors.darkGray,
		lineHeight: Dimensions.lineHeight.sm,
		textAlign: "left",
		width: "100%",
	},
	meta: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: Dimensions.spacing.xs,
	},
	assignee: {
		fontSize: Dimensions.fontSize.sm,
		color: Colors.primary,
		fontWeight: "600",
		backgroundColor: Colors.primaryLight + "15",
		paddingHorizontal: Dimensions.spacing.md,
		paddingVertical: Dimensions.spacing.xs,
		borderRadius: Dimensions.borderRadius.md,
		overflow: "hidden",
	},
	date: {
		fontSize: Dimensions.fontSize.xs,
		color: Colors.textTertiary,
		fontWeight: "500",
	},
	statusContainer: {
		alignItems: "center",
		justifyContent: "flex-start",
		paddingLeft: Dimensions.spacing.lg,
		paddingTop: Dimensions.spacing.xs,
		minWidth: Math.max(
			Dimensions.statusIndicator.large + Dimensions.spacing.sm,
			44,
		),
	},
});
