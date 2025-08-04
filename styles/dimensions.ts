export const Dimensions = {
	// Base unit for consistent scaling (4px)
	base: 4,

	// Spacing - Based on 4px increments for perfect harmony
	spacing: {
		xs: 4, // 1x base
		sm: 8, // 2x base
		md: 12, // 3x base (was 10)
		lg: 16, // 4x base (was 12)
		xl: 20, // 5x base (was 15)
		xxl: 24, // 6x base (was 20)
	},

	// Border Radius - Harmonic progression using base unit
	borderRadius: {
		sm: 4, // 1x base
		md: 8, // 2x base
		lg: 12, // 3x base (was 10)
		xl: 20, // 5x base (keeping for visual consistency)
	},

	// Font Sizes - Based on typographic scale (1.25 ratio)
	fontSize: {
		xs: 12, // Base small
		sm: 14, // 1.17x
		md: 16, // 1.33x (primary)
		lg: 18, // 1.5x
		xl: 24, // 2x
		xxl: 32, // 2.67x
	},

	// Line Heights - Consistent 1.4 multiplier for readability
	lineHeight: {
		xs: 12 * 1.4, // 16.8
		sm: 14 * 1.4, // 19.6
		md: 16 * 1.4, // 22.4
		lg: 18 * 1.4, // 25.2
		xl: 24 * 1.4, // 33.6
		xxl: 32 * 1.4, // 44.8 (was 1.2, now consistent)
	},

	// Component Sizes - Using harmonic base units
	button: {
		height: 40, // 10x base
		borderRadius: 20, // 5x base
		fab: {
			width: 56, // 14x base
			height: 56, // 14x base
			borderRadius: 28, // 7x base
		},
	},

	// Header - Using spacing scale
	header: {
		paddingVertical: 24, // xxl spacing
		titleLetterSpacing: -0.5,
	},

	input: {
		height: 100, // 25x base for text area
		minHeight: 44, // 11x base for single line
		borderWidth: 1, // Minimal border
		borderWidthError: 2, // 0.5x base for emphasis
		iconSize: 24, // 6x base
		iconSpacing: 48, // xl + iconSize + sm = 20 + 24 + 4 = 48 (12x base)
	},

	statusIndicator: {
		small: 8, // 2x base
		medium: 12, // 3x base
		large: 20, // 5x base
	},

	// Shadows - Enhanced with modern depth
	shadow: {
		small: {
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.08,
			shadowRadius: 4,
			elevation: 3,
		},
		medium: {
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.12,
			shadowRadius: 8,
			elevation: 6,
		},
		large: {
			shadowOffset: { width: 0, height: 8 },
			shadowOpacity: 0.15,
			shadowRadius: 16,
			elevation: 12,
		},
		card: {
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.06,
			shadowRadius: 6,
			elevation: 4,
		},
		floating: {
			shadowOffset: { width: 0, height: 6 },
			shadowOpacity: 0.18,
			shadowRadius: 12,
			elevation: 8,
		},
	},

	// Z-Index
	zIndex: {
		dropdown: 1000,
		dropdownMenu: 1001,
	},
};
