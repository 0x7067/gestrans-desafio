import type { Task } from "../types/Task";

export const compareTasks = (a: Task, b: Task) => {
	if (a.completed === b.completed) {
		return Number(b.id) - Number(a.id);
	}
	return a.completed ? 1 : -1;
};
