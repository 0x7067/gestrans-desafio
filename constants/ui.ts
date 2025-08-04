/**
 * UI-related constants
 */

export const OPACITY = {
	/** Opacity for disabled elements */
	DISABLED: 0.6,
} as const;

export const PAGINATION = {
	/** Default number of items per page */
	DEFAULT_PAGE_SIZE: 10,

	/** Threshold for triggering infinite scroll */
	END_REACHED_THRESHOLD: 0.1,
} as const;

export const FORM = {
	/** Number of lines for multiline text inputs */
	MULTILINE_LINES: 4,
	SINGLELINE_LINES: 1,

	/** Number of lines for task description preview */
	DESCRIPTION_PREVIEW_LINES: 4,
} as const;
