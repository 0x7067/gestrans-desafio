/**
 * Filter and sorting constants
 */

export const FILTER_STATUS = {
	ALL: "all",
	COMPLETED: "completed",
	INCOMPLETE: "incomplete",
} as const;

export type FilterStatus = (typeof FILTER_STATUS)[keyof typeof FILTER_STATUS];

export const FILTER_OPTIONS = [
	{ label: "All", value: FILTER_STATUS.ALL },
	{ label: "Completed", value: FILTER_STATUS.COMPLETED },
	{ label: "Incomplete", value: FILTER_STATUS.INCOMPLETE },
] as const;
