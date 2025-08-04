import { z } from "zod";

export const taskSchema = z.object({
	title: z
		.string()
		.min(1, "Title is required")
		.max(100, "Title must be less than 100 characters"),
	description: z
		.string()
		.max(500, "Description must be less than 500 characters"),
	assignee: z
		.string()
		.min(1, "Assignee is required")
		.max(50, "Assignee must be less than 50 characters"),
	completed: z.boolean(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

export interface UseTaskValidationReturn {
	validateField: <K extends keyof TaskFormData>(
		field: K,
		value: TaskFormData[K],
	) => { isValid: boolean; error?: string };
	validateForm: (data: TaskFormData) => {
		isValid: boolean;
		errors: Record<string, string>;
	};
	schema: typeof taskSchema;
}

export function useTaskValidation(): UseTaskValidationReturn {
	const validateField = <K extends keyof TaskFormData>(
		field: K,
		value: TaskFormData[K],
	): { isValid: boolean; error?: string } => {
		try {
			// Create a partial schema for the specific field
			const fieldSchema = taskSchema.shape[field];
			fieldSchema.parse(value);
			return { isValid: true };
		} catch (error) {
			if (error instanceof z.ZodError) {
				return {
					isValid: false,
					error: error.issues[0]?.message,
				};
			}
			return { isValid: false, error: "Validation error" };
		}
	};

	const validateForm = (
		data: TaskFormData,
	): { isValid: boolean; errors: Record<string, string> } => {
		try {
			taskSchema.parse(data);
			return { isValid: true, errors: {} };
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errors: Record<string, string> = {};
				error.issues.forEach((err) => {
					if (err.path[0]) {
						errors[err.path[0] as string] = err.message;
					}
				});
				return { isValid: false, errors };
			}
			return { isValid: false, errors: { general: "Validation error" } };
		}
	};

	return {
		validateField,
		validateForm,
		schema: taskSchema,
	};
}
