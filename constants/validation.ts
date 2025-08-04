/**
 * Form validation constants
 */

export const FIELD_LIMITS = {
	/** Maximum length for task title */
	TITLE_MAX_LENGTH: 100,

	/** Maximum length for task description */
	DESCRIPTION_MAX_LENGTH: 500,

	/** Maximum length for assignee name */
	ASSIGNEE_MAX_LENGTH: 50,
} as const;
