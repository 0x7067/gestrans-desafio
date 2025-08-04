import { render } from "@testing-library/react-native";
import Index from "../app/index";

jest.mock("../app/tasks", () => {
	const React = require("react");
	const { Text } = require("react-native");
	function MockTaskListScreen() {
		return React.createElement(Text, null, "TaskListScreen");
	}
	MockTaskListScreen.displayName = "MockTaskListScreen";
	return MockTaskListScreen;
});

describe("Index", () => {
	it("renders TaskListScreen component", () => {
		const { toJSON } = render(<Index />);
		expect(toJSON()).toBeTruthy();
	});

	it("does not throw any errors", () => {
		expect(() => render(<Index />)).not.toThrow();
	});
});
