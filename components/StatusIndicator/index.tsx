import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/styles/colors";
import { Dimensions } from "@/styles/dimensions";

type StatusType = "online" | "offline" | "completed" | "pending";

interface StatusIndicatorProps {
	status: StatusType;
	size?: "small" | "medium" | "large";
	variant?: "default" | "badge";
	label?: string;
	testID?: string;
}

const statusConfig = {
	online: {
		color: Colors.online,
	},
	offline: {
		color: Colors.offline,
	},
	completed: {
		color: Colors.completed,
	},
	pending: {
		color: Colors.pending,
	},
};

const StatusIndicator = React.memo(
	function StatusIndicator({
		status,
		size = "small",
		variant = "default",
		label,
		testID,
	}: StatusIndicatorProps) {
		const config = statusConfig[status];

		if (variant === "badge") {
			return (
				<View
					style={[styles.badge, { backgroundColor: config.color }]}
					testID={testID || `status-indicator-${status}-badge`}
				>
					<Text style={styles.badgeText}>{label || status.toUpperCase()}</Text>
				</View>
			);
		}

		return (
			<View
				style={styles.container}
				testID={testID || `status-indicator-${status}`}
			>
				<View
					style={[
						styles.indicator,
						styles[size],
						{ backgroundColor: config.color },
					]}
				/>
			</View>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.status === nextProps.status &&
			prevProps.size === nextProps.size &&
			prevProps.variant === nextProps.variant &&
			prevProps.label === nextProps.label &&
			prevProps.testID === nextProps.testID
		);
	},
);

export default StatusIndicator;

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
	},
	indicator: {},
	small: {
		width: Dimensions.statusIndicator.small,
		height: Dimensions.statusIndicator.small,
		borderRadius: Dimensions.statusIndicator.small / 2,
	},
	medium: {
		width: Dimensions.statusIndicator.medium,
		height: Dimensions.statusIndicator.medium,
		borderRadius: Dimensions.statusIndicator.medium / 2,
	},
	large: {
		width: Dimensions.statusIndicator.large,
		height: Dimensions.statusIndicator.large,
		borderRadius: Dimensions.statusIndicator.large / 2,
	},
	badge: {
		paddingHorizontal: Dimensions.spacing.lg,
		paddingVertical: Dimensions.spacing.xs,
		borderRadius: Dimensions.borderRadius.xl,
		alignSelf: "flex-start",
	},
	badgeText: {
		fontSize: Dimensions.fontSize.xs,
		color: Colors.white,
		fontWeight: "600",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
});
