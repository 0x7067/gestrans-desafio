import { taskApi } from "../services/api";
import { testDataFactory } from "../test-utils/types";

global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const mockTask = testDataFactory.createMockTask();

const mockTasks = testDataFactory.createMockTasks(2);

describe("taskApi", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("fetches all tasks successfully", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: jest.fn().mockResolvedValue(mockTasks),
			} as Partial<Response>);

			const result = await taskApi.getAll();

			expect(mockFetch).toHaveBeenCalledWith(
				"https://688bdca6cd9d22dda5cb850d.mockapi.io/api/v1/tasks",
				{ signal: expect.any(AbortSignal) },
			);
			expect(result).toEqual(mockTasks);
		});

		it("throws error when fetch fails", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
			} as Partial<Response>);

			await expect(taskApi.getAll()).rejects.toThrow("HTTP 500: undefined");
		});
	});

	describe("getById", () => {
		it("fetches task by id successfully", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: jest.fn().mockResolvedValue(mockTask),
			} as Partial<Response>);

			const result = await taskApi.getById("1");

			expect(mockFetch).toHaveBeenCalledWith(
				"https://688bdca6cd9d22dda5cb850d.mockapi.io/api/v1/tasks/1",
				{ signal: expect.any(AbortSignal) },
			);
			expect(result).toEqual(mockTask);
		});

		it("throws error when fetch fails", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
			} as Partial<Response>);

			await expect(taskApi.getById("1")).rejects.toThrow("HTTP 404: undefined");
		});
	});

	describe("create", () => {
		it("creates task successfully", async () => {
			const newTask = {
				title: "New Task",
				description: "New Description",
				assignee: "New Assignee",
				completed: false,
			};

			const createdTask = testDataFactory.createMockTask({
				...newTask,
				id: "3",
				createdAt: "2023-01-03T00:00:00.000Z",
			});

			mockFetch.mockResolvedValueOnce(
				testDataFactory.createMockApiResponse(createdTask),
			);

			const result = await taskApi.create(newTask);

			expect(mockFetch).toHaveBeenCalledWith(
				"https://688bdca6cd9d22dda5cb850d.mockapi.io/api/v1/tasks",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(newTask),
					signal: expect.any(AbortSignal),
				},
			);
			expect(result).toEqual(createdTask);
		});

		it("throws error when creation fails", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
			} as Partial<Response>);

			const newTask = {
				title: "New Task",
				description: "New Description",
				assignee: "New Assignee",
				completed: false,
			};

			await expect(taskApi.create(newTask)).rejects.toThrow(
				"HTTP 400: undefined",
			);
		});
	});

	describe("update", () => {
		it("updates task successfully", async () => {
			const updateData = {
				title: "Updated Task",
				completed: true,
			};

			const updatedTask = {
				...mockTask,
				...updateData,
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: jest.fn().mockResolvedValue(updatedTask),
			} as Partial<Response>);

			const result = await taskApi.update("1", updateData);

			expect(mockFetch).toHaveBeenCalledWith(
				"https://688bdca6cd9d22dda5cb850d.mockapi.io/api/v1/tasks/1",
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(updateData),
					signal: expect.any(AbortSignal),
				},
			);
			expect(result).toEqual(updatedTask);
		});

		it("throws error when update fails", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
			} as Partial<Response>);

			const updateData = { title: "Updated Task" };

			await expect(taskApi.update("1", updateData)).rejects.toThrow(
				"HTTP 404: undefined",
			);
		});
	});

	describe("delete", () => {
		it("deletes task successfully", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
			} as Partial<Response>);

			await taskApi.delete("1");

			expect(mockFetch).toHaveBeenCalledWith(
				"https://688bdca6cd9d22dda5cb850d.mockapi.io/api/v1/tasks/1",
				{
					method: "DELETE",
					signal: expect.any(AbortSignal),
				},
			);
		});

		it("throws error when deletion fails", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
			} as Partial<Response>);

			await expect(taskApi.delete("1")).rejects.toThrow("HTTP 404: undefined");
		});
	});

	describe("network error handling", () => {
		it("handles network errors in getAll", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));

			await expect(taskApi.getAll()).rejects.toThrow("Network error");
		});

		it("handles network errors in getById", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));

			await expect(taskApi.getById("1")).rejects.toThrow("Network error");
		});

		it("handles network errors in create", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));

			const newTask = {
				title: "New Task",
				description: "New Description",
				assignee: "New Assignee",
				completed: false,
			};

			await expect(taskApi.create(newTask)).rejects.toThrow("Network error");
		});

		it("handles network errors in update", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));

			await expect(taskApi.update("1", { title: "Updated" })).rejects.toThrow(
				"Network error",
			);
		});

		it("handles network errors in delete", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));

			await expect(taskApi.delete("1")).rejects.toThrow("Network error");
		});
	});
});
