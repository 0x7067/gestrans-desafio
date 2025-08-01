export interface Task {
	id: string;
	createdAt: string;
	title: string;
	description: string;
	completed: boolean;
	assignee: string;
}
