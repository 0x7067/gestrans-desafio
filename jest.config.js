const { defaults } = require("jest-config");

module.exports = {
	preset: "react-native",
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	testEnvironment: "jsdom",
	moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
	transform: {
		"^.+\\.(ts|tsx)$": "babel-jest",
	},
	testMatch: ["**/__tests__/**/*.(ts|tsx|js)", "**/*.(test|spec).(ts|tsx|js)"],
	collectCoverageFrom: [
		"app/**/*.{ts,tsx}",
		"hooks/**/*.{ts,tsx}",
		"services/**/*.{ts,tsx}",
		"types/**/*.{ts,tsx}",
		"!**/*.d.ts",
		"!**/node_modules/**",
	],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
	},
	transformIgnorePatterns: [
		"node_modules/(?!(react-native|@react-native|@expo|expo-.*|@tanstack/react-query)/)",
	],
};
