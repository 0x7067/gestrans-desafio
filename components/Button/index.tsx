import type { ReactNode } from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	type TouchableOpacityProps,
} from "react-native";

import { OPACITY } from "@/constants";
import { Colors } from "@/styles/colors";
import { Dimensions } from "@/styles/dimensions";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends TouchableOpacityProps {
	title: string;
	variant?: ButtonVariant;
	isLoading?: boolean;
	loadingText?: string;
	fullWidth?: boolean;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	size?: ButtonSize;
}

export default function Button({
	title,
	variant = "primary",
	isLoading = false,
	loadingText = "Loading...",
	disabled = false,
	fullWidth = false,
	leftIcon,
	rightIcon,
	style,
	testID,
	...props
}: ButtonProps) {
	const isDisabled = disabled || isLoading;

	const resolvedTestID =
		testID || `button-${title.toLowerCase().replace(/\s+/g, "-")}`;

	return (
		<TouchableOpacity
			accessibilityRole="button"
			accessibilityLabel={isLoading ? loadingText : title}
			accessibilityHint={
				isLoading ? "Button is loading" : `Press to ${title.toLowerCase()}`
			}
			accessibilityState={{
				disabled: isDisabled,
				busy: isLoading,
			}}
			importantForAccessibility="yes"
			style={[
				styles.button,
				styles[variant],
				fullWidth && styles.fullWidth,
				isDisabled && styles.disabled,
				style,
			]}
			disabled={isDisabled}
			testID={resolvedTestID}
			{...props}
		>
			{isLoading && (
				<ActivityIndicator
					size="small"
					color={variant === "secondary" ? Colors.primary : Colors.white}
					style={styles.loader}
				/>
			)}
			{leftIcon && !isLoading && leftIcon}
			<Text
				style={[
					styles.text,
					styles[`${variant}Text` as keyof typeof styles],
					leftIcon || rightIcon || isLoading ? styles.textWithIcon : undefined,
				]}
			>
				{isLoading ? loadingText : title}
			</Text>
			{rightIcon && !isLoading && rightIcon}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		borderRadius: Dimensions.borderRadius.lg,
		padding: Dimensions.spacing.xl,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		minHeight: Math.max(Dimensions.button.height, 44),
	},
	fullWidth: {
		width: "100%",
	},
	primary: {
		backgroundColor: Colors.primary,
	},
	secondary: {
		backgroundColor: Colors.white,
		borderWidth: Dimensions.input.borderWidth,
		borderColor: Colors.primary,
	},
	danger: {
		backgroundColor: Colors.error,
	},
	disabled: {
		opacity: OPACITY.DISABLED,
	},
	text: {
		fontSize: Dimensions.fontSize.md,
		fontWeight: "600",
	},
	primaryText: {
		color: Colors.white,
	},
	secondaryText: {
		color: Colors.primaryDark || Colors.primary,
	},
	dangerText: {
		color: Colors.white,
	},
	loader: {
		marginRight: Dimensions.spacing.sm,
	},
	textWithIcon: {
		marginLeft: Dimensions.spacing.sm,
	},
});
