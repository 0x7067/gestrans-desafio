import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/styles/colors";
import { Dimensions } from "@/styles/dimensions";

interface LoadingIndicatorProps {
	size?: "small" | "large";
	message?: string;
	color?: string;
	isFullScreen?: boolean;
}

export default function LoadingIndicator({
	size = "large",
	message,
	color = Colors.primary,
	isFullScreen = false,
}: LoadingIndicatorProps) {
	const containerStyle = isFullScreen
		? styles.fullScreenContainer
		: styles.container;

	return (
		<View style={containerStyle}>
			<ActivityIndicator size={size} color={color} testID="loading-indicator" />
			{message && <Text style={styles.message}>{message}</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		justifyContent: "center",
		alignItems: "center",
		padding: Dimensions.spacing.xl,
	},
	fullScreenContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.backgroundGray,
	},
	message: {
		marginTop: Dimensions.spacing.md,
		fontSize: Dimensions.fontSize.md,
		color: Colors.lightGray,
		textAlign: "center",
	},
});
