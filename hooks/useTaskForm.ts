import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import type { Task } from "../types/Task";
import { type TaskFormData, taskSchema } from "./useTaskValidation";

/**
 * Props for the useTaskForm hook
 */
export interface UseTaskFormProps {
	/** Optional task data for editing existing task */
	task?: Task;
}

/**
 * Hook for managing task form state and validation
 * @param props - Hook configuration
 * @param props.task - Optional task data for editing
 * @returns {UseFormReturn<TaskFormData>} React Hook Form methods and state
 *
 * @example
 * ```tsx
 * const form = useTaskForm({ task: existingTask });
 * const { control, handleSubmit, formState } = form;
 *
 * const onSubmit = (data) => {
 *   console.log('Form data:', data);
 * };
 * ```
 */
export function useTaskForm({
	task,
}: UseTaskFormProps = {}): UseFormReturn<TaskFormData> {
	const form = useForm<TaskFormData>({
		resolver: zodResolver(taskSchema),
		defaultValues: {
			title: "",
			description: "",
			assignee: "",
			completed: false,
		},
		mode: "onChange",
	});

	useEffect(() => {
		if (task) {
			form.reset({
				title: task.title,
				description: task.description,
				assignee: task.assignee,
				completed: task.completed,
			});
		}
	}, [task, form]);

	return form;
}
