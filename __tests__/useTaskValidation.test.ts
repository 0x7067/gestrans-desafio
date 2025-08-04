import { renderHook } from "@testing-library/react-native";
import { useTaskValidation } from "../hooks/useTaskValidation";

describe("useTaskValidation", () => {
	describe("validateField", () => {
		it("validates title field correctly", () => {
			const { result } = renderHook(() => useTaskValidation());

			// Valid title
			const validResult = result.current.validateField("title", "Valid Title");
			expect(validResult.isValid).toBe(true);
			expect(validResult.error).toBeUndefined();

			// Empty title
			const emptyResult = result.current.validateField("title", "");
			expect(emptyResult.isValid).toBe(false);
			expect(emptyResult.error).toBe("Title is required");

			// Title too long
			const longResult = result.current.validateField("title", "a".repeat(101));
			expect(longResult.isValid).toBe(false);
			expect(longResult.error).toBe("Title must be less than 100 characters");
		});

		it("validates description field correctly", () => {
			const { result } = renderHook(() => useTaskValidation());

			// Valid description
			const validResult = result.current.validateField(
				"description",
				"Valid description",
			);
			expect(validResult.isValid).toBe(true);
			expect(validResult.error).toBeUndefined();

			// Empty description (should be valid)
			const emptyResult = result.current.validateField("description", "");
			expect(emptyResult.isValid).toBe(true);
			expect(emptyResult.error).toBeUndefined();

			// Description too long
			const longResult = result.current.validateField(
				"description",
				"a".repeat(501),
			);
			expect(longResult.isValid).toBe(false);
			expect(longResult.error).toBe(
				"Description must be less than 500 characters",
			);
		});

		it("validates assignee field correctly", () => {
			const { result } = renderHook(() => useTaskValidation());

			// Valid assignee
			const validResult = result.current.validateField("assignee", "John Doe");
			expect(validResult.isValid).toBe(true);
			expect(validResult.error).toBeUndefined();

			// Empty assignee
			const emptyResult = result.current.validateField("assignee", "");
			expect(emptyResult.isValid).toBe(false);
			expect(emptyResult.error).toBe("Assignee is required");

			// Assignee too long
			const longResult = result.current.validateField(
				"assignee",
				"a".repeat(51),
			);
			expect(longResult.isValid).toBe(false);
			expect(longResult.error).toBe("Assignee must be less than 50 characters");
		});

		it("validates completed field correctly", () => {
			const { result } = renderHook(() => useTaskValidation());

			const trueResult = result.current.validateField("completed", true);
			expect(trueResult.isValid).toBe(true);
			expect(trueResult.error).toBeUndefined();

			const falseResult = result.current.validateField("completed", false);
			expect(falseResult.isValid).toBe(true);
			expect(falseResult.error).toBeUndefined();
		});
	});

	describe("validateForm", () => {
		it("returns valid result for valid form data", () => {
			const { result } = renderHook(() => useTaskValidation());

			const validData = {
				title: "Valid Title",
				description: "Valid description",
				assignee: "John Doe",
				completed: false,
			};

			const validationResult = result.current.validateForm(validData);

			expect(validationResult.isValid).toBe(true);
			expect(validationResult.errors).toEqual({});
		});

		it("returns invalid result with errors for invalid form data", () => {
			const { result } = renderHook(() => useTaskValidation());

			const invalidData = {
				title: "",
				description: "a".repeat(501),
				assignee: "",
				completed: false,
			};

			const validationResult = result.current.validateForm(invalidData);

			expect(validationResult.isValid).toBe(false);
			expect(validationResult.errors.title).toBe("Title is required");
			expect(validationResult.errors.description).toBe(
				"Description must be less than 500 characters",
			);
			expect(validationResult.errors.assignee).toBe("Assignee is required");
		});

		it("handles multiple validation errors correctly", () => {
			const { result } = renderHook(() => useTaskValidation());

			const invalidData = {
				title: "a".repeat(101),
				description: "a".repeat(501),
				assignee: "a".repeat(51),
				completed: false,
			};

			const validationResult = result.current.validateForm(invalidData);

			expect(validationResult.isValid).toBe(false);
			expect(validationResult.errors.title).toBe(
				"Title must be less than 100 characters",
			);
			expect(validationResult.errors.description).toBe(
				"Description must be less than 500 characters",
			);
			expect(validationResult.errors.assignee).toBe(
				"Assignee must be less than 50 characters",
			);
		});

		it("validates with mixed valid and invalid fields", () => {
			const { result } = renderHook(() => useTaskValidation());

			const mixedData = {
				title: "Valid Title",
				description: "a".repeat(501), // Invalid
				assignee: "John Doe",
				completed: false,
			};

			const validationResult = result.current.validateForm(mixedData);

			expect(validationResult.isValid).toBe(false);
			expect(validationResult.errors.title).toBeUndefined();
			expect(validationResult.errors.description).toBe(
				"Description must be less than 500 characters",
			);
			expect(validationResult.errors.assignee).toBeUndefined();
		});
	});

	describe("schema", () => {
		it("provides access to the validation schema", () => {
			const { result } = renderHook(() => useTaskValidation());

			expect(result.current.schema).toBeDefined();
			expect(typeof result.current.schema.parse).toBe("function");
		});
	});
});
