import React, { useCallback, useState } from "react";
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	type ViewStyle,
} from "react-native";
import { Colors } from "@/styles/colors";
import { Dimensions } from "@/styles/dimensions";

interface DropdownOption<T = string> {
	label: string;
	value: T;
}

interface DropdownProps<T = string> {
	options: readonly DropdownOption<T>[];
	value: T;
	onChange: (value: T) => void;
	placeholder?: string;
	isDisabled?: boolean;
	style?: ViewStyle;
	testID?: string;
}

const Dropdown = React.memo(function Dropdown<T = string>({
	options,
	value,
	onChange,
	placeholder = "Select an option",
	isDisabled = false,
	style,
	testID,
}: DropdownProps<T>) {
	const [isOpen, setIsOpen] = useState(false);

	const selectedOption = options.find((option) => option.value === value);
	const displayText = selectedOption?.label || placeholder;

	const handleSelect = useCallback(
		(selectedValue: T) => {
			onChange(selectedValue);
			setIsOpen(false);
		},
		[onChange],
	);

	return (
		<View style={[styles.container, style]} testID={testID || "dropdown"}>
			<TouchableOpacity
				accessibilityRole="combobox"
				accessibilityLabel={displayText}
				accessibilityHint={isOpen ? "Close dropdown" : "Open dropdown"}
				accessibilityState={{
					expanded: isOpen,
					disabled: isDisabled,
				}}
				importantForAccessibility="yes"
				style={[
					styles.button,
					isOpen && styles.buttonOpen,
					isDisabled && styles.buttonDisabled,
				]}
				onPress={() => !isDisabled && setIsOpen(!isOpen)}
				disabled={isDisabled}
				testID={testID ? `${testID}-button` : "dropdown-button"}
			>
				<Text
					style={[
						styles.buttonText,
						!selectedOption && styles.placeholderText,
						isDisabled && styles.disabledText,
					]}
				>
					{displayText}
				</Text>
				<Text style={[styles.arrow, isOpen && styles.arrowOpen]}>▼</Text>
			</TouchableOpacity>

			{isOpen && (
				<View
					style={styles.dropdown}
					testID={testID ? `${testID}-menu` : "dropdown-menu"}
				>
					{options.map((option, index) => (
						<TouchableOpacity
							accessibilityRole="menuitem"
							accessibilityLabel={`Select ${option.label}`}
							accessibilityHint={
								option.value === value ? "Currently selected" : undefined
							}
							accessibilityState={{
								selected: option.value === value,
								disabled: isDisabled,
							}}
							importantForAccessibility="yes"
							key={`${option.value}-${index}`}
							style={[
								styles.option,
								option.value === value && styles.selectedOption,
								index === options.length - 1 && styles.lastOption,
							]}
							onPress={() => handleSelect(option.value)}
							testID={
								testID
									? `${testID}-option-${String(option.value)}`
									: `dropdown-option-${String(option.value)}`
							}
						>
							<Text
								style={[
									styles.optionText,
									option.value === value && styles.selectedOptionText,
								]}
							>
								{option.label}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			)}
		</View>
	);
});

export default Dropdown;

const styles = StyleSheet.create({
	container: {
		position: "relative",
		zIndex: Dimensions.zIndex.dropdown,
	},
	button: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: Dimensions.spacing.lg,
		paddingVertical: Dimensions.spacing.md,
		borderWidth: Dimensions.input.borderWidth,
		borderColor: Colors.borderGray,
		borderRadius: Dimensions.borderRadius.md,
		backgroundColor: Colors.inputGray,
	},
	buttonOpen: {
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
		borderColor: Colors.primary,
	},
	buttonDisabled: {
		backgroundColor: Colors.paleGray,
		opacity: 0.6,
	},
	buttonText: {
		fontSize: Dimensions.fontSize.md,
		color: Colors.darkGray,
		flex: 1,
	},
	placeholderText: {
		color: Colors.textSecondary,
	},
	disabledText: {
		color: Colors.textSecondary,
	},
	arrow: {
		fontSize: Dimensions.fontSize.xs,
		color: Colors.lightGray,
		marginLeft: Dimensions.spacing.sm,
		transform: [{ rotate: "0deg" }],
	},
	arrowOpen: {
		transform: [{ rotate: "180deg" }],
	},
	dropdown: {
		position: "absolute",
		top: "100%",
		left: 0,
		right: 0,
		backgroundColor: Colors.white,
		borderWidth: Dimensions.input.borderWidth,
		borderColor: Colors.primary,
		borderTopWidth: 0,
		borderBottomLeftRadius: Dimensions.borderRadius.md,
		borderBottomRightRadius: Dimensions.borderRadius.md,
		shadowColor: Colors.black,
		shadowOffset: Dimensions.shadow.medium.shadowOffset,
		shadowOpacity: Dimensions.shadow.small.shadowOpacity,
		shadowRadius: Dimensions.shadow.medium.shadowRadius,
		elevation: Dimensions.shadow.medium.elevation,
		zIndex: Dimensions.zIndex.dropdownMenu,
	},
	option: {
		paddingHorizontal: Dimensions.spacing.lg,
		paddingVertical: Dimensions.spacing.lg,
		minHeight: 44,
		borderBottomWidth: Dimensions.input.borderWidth,
		borderBottomColor: Colors.lightBorderGray,
	},
	lastOption: {
		borderBottomWidth: 0,
	},
	selectedOption: {
		backgroundColor: Colors.primary,
	},
	optionText: {
		fontSize: Dimensions.fontSize.md,
		color: Colors.darkGray,
	},
	selectedOptionText: {
		color: Colors.white,
		fontWeight: "600",
	},
});
