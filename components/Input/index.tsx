import type { ReactNode } from "react";
import {
	StyleSheet,
	Text,
	TextInput,
	type TextInputProps,
	View,
} from "react-native";
import { FORM } from "@/constants";
import { Colors } from "@/styles/colors";
import { Dimensions } from "@/styles/dimensions";

interface InputProps extends TextInputProps {
	label?: string;
	error?: string;
	required?: boolean;
	multiline?: boolean;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	helpText?: string;
}

export default function Input({
	label,
	error,
	required = false,
	multiline = false,
	leftIcon,
	rightIcon,
	helpText,
	style,
	testID,
	...props
}: InputProps) {
	return (
		<View style={styles.container}>
			{label && (
				<Text style={styles.label}>
					{label}
					{required && <Text style={styles.required}> *</Text>}
				</Text>
			)}
			<View style={styles.inputContainer}>
				{leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
				<TextInput
					style={[
						styles.input,
						error && styles.inputError,
						!!leftIcon && styles.inputWithIcon,
						style,
					]}
					placeholderTextColor={Colors.textSecondary}
					numberOfLines={
						multiline ? FORM.MULTILINE_LINES : FORM.SINGLELINE_LINES
					}
					accessibilityLabel={label || props.placeholder}
					accessibilityHint={error ? "Contains error" : undefined}
					accessibilityState={{
						disabled: props.editable === false,
					}}
					importantForAccessibility="yes"
					testID={testID}
					{...props}
				/>
			</View>
			{!error && helpText && <Text style={styles.helpText}>{helpText}</Text>}
			{error && <Text style={styles.errorText}>{error}</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: Dimensions.spacing.xxl,
	},
	label: {
		fontSize: Dimensions.fontSize.md,
		fontWeight: "600",
		color: Colors.textPrimary,
		marginBottom: Dimensions.spacing.sm,
	},
	required: {
		color: Colors.error,
	},
	inputContainer: {
		position: "relative",
		flexDirection: "row",
		alignItems: "center",
	},
	input: {
		backgroundColor: Colors.inputGray,
		borderRadius: Dimensions.borderRadius.xl,
		padding: Dimensions.spacing.xl,
		fontSize: Dimensions.fontSize.md,
		borderWidth: Dimensions.input.borderWidth,
		borderColor: Colors.lightBorderGray,
		color: Colors.textPrimary,
		flex: 1,
		shadowColor: Colors.shadowSecondary,
		shadowOffset: Dimensions.shadow.small.shadowOffset,
		shadowOpacity: 0.05,
		shadowRadius: Dimensions.shadow.small.shadowRadius,
		elevation: 1,
	},
	inputWithIcon: {
		paddingLeft: Dimensions.input.iconSpacing,
	},
	helpText: {
		color: Colors.textSecondary,
		fontSize: Dimensions.fontSize.sm,
		marginTop: Dimensions.spacing.xs,
		marginLeft: Dimensions.spacing.xs,
	},
	inputError: {
		borderColor: Colors.error,
		borderWidth: Dimensions.input.borderWidthError,
	},
	iconContainer: {
		position: "absolute",
		left: Dimensions.spacing.xl,
		zIndex: 1,
	},
	errorText: {
		color: Colors.error,
		fontSize: Dimensions.fontSize.sm,
		marginTop: Dimensions.spacing.xs,
		marginLeft: Dimensions.spacing.xs,
	},
});
