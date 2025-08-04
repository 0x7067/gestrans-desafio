// Native module mocks
jest.mock("@react-native-async-storage/async-storage", () => ({
	setItem: jest.fn(() => Promise.resolve()),
	getItem: jest.fn(() => Promise.resolve(null)),
	removeItem: jest.fn(() => Promise.resolve()),
	mergeItem: jest.fn(() => Promise.resolve()),
	clear: jest.fn(() => Promise.resolve()),
	getAllKeys: jest.fn(() => Promise.resolve([])),
	multiGet: jest.fn(() => Promise.resolve([])),
	multiSet: jest.fn(() => Promise.resolve()),
	multiRemove: jest.fn(() => Promise.resolve()),
	multiMerge: jest.fn(() => Promise.resolve()),
}));

jest.mock("@react-native-community/netinfo", () => ({
	addEventListener: jest.fn(() => jest.fn()),
	fetch: jest.fn(() =>
		Promise.resolve({
			isConnected: true,
			type: "wifi",
			isInternetReachable: true,
			details: {},
		}),
	),
	useNetInfo: jest.fn(() => ({
		isConnected: true,
		type: "wifi",
	})),
}));

// Expo Router mocks
jest.mock("expo-router", () => ({
	useRouter: jest.fn(() => ({
		push: jest.fn(),
		back: jest.fn(),
		replace: jest.fn(),
		canGoBack: jest.fn(() => true),
		navigate: jest.fn(),
		dismiss: jest.fn(),
		dismissTo: jest.fn(),
		canDismiss: jest.fn(() => true),
		go: jest.fn(),
		setParams: jest.fn(),
		getId: jest.fn(),
		getState: jest.fn(),
		getParent: jest.fn(),
		getPath: jest.fn(),
	})),
	useLocalSearchParams: jest.fn(() => ({})),
	useGlobalSearchParams: jest.fn(() => ({})),
	useNavigation: jest.fn(() => ({
		navigate: jest.fn(),
		goBack: jest.fn(),
		addListener: jest.fn(),
		removeListener: jest.fn(),
	})),
	Stack: {
		Screen: ({ children }) => children,
	},
}));

jest.mock("react-native-safe-area-context", () => ({
	SafeAreaProvider: ({ children }) => children,
	SafeAreaView: ({ children }) => children,
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// TanStack Query mocks
jest.mock("@tanstack/react-query", () => {
	const actual = jest.requireActual("@tanstack/react-query");
	return {
		...actual,
		QueryClient: jest.fn().mockImplementation(() => ({
			invalidateQueries: jest.fn(),
			mount: jest.fn(),
			unmount: jest.fn(),
			isFetching: jest.fn(),
			getQueryData: jest.fn(),
			setQueryData: jest.fn(),
			removeQueries: jest.fn(),
			resetQueries: jest.fn(),
			refetchQueries: jest.fn(),
			fetchQuery: jest.fn(),
			prefetchQuery: jest.fn(),
			cancelQueries: jest.fn(),
			getQueryCache: jest.fn(),
			getMutationCache: jest.fn(),
			getDefaultOptions: jest.fn(),
			setDefaultOptions: jest.fn(),
			getQueryDefaults: jest.fn(),
			setQueryDefaults: jest.fn(),
			getMutationDefaults: jest.fn(),
			setMutationDefaults: jest.fn(),
			clear: jest.fn(),
		})),
		QueryClientProvider: ({ children }) => children,
		useQuery: jest.fn(),
		useMutation: jest.fn(),
		useInfiniteQuery: jest.fn(),
		useQueryClient: jest.fn(() => ({
			invalidateQueries: jest.fn(),
			mount: jest.fn(),
			unmount: jest.fn(),
			isFetching: jest.fn(),
			getQueryData: jest.fn(),
			setQueryData: jest.fn(),
			removeQueries: jest.fn(),
			resetQueries: jest.fn(),
			refetchQueries: jest.fn(),
			fetchQuery: jest.fn(),
			prefetchQuery: jest.fn(),
			cancelQueries: jest.fn(),
			getQueryCache: jest.fn(),
			getMutationCache: jest.fn(),
			getDefaultOptions: jest.fn(),
			setDefaultOptions: jest.fn(),
			getQueryDefaults: jest.fn(),
			setQueryDefaults: jest.fn(),
			getMutationDefaults: jest.fn(),
			setMutationDefaults: jest.fn(),
			clear: jest.fn(),
		})),
	};
});

// React Native mocks
global.Alert = {
	alert: jest.fn(),
};

global.console = {
	...console,
	error: jest.fn(),
	warn: jest.fn(),
};

// Mock react-native components
jest.mock("react-native", () => {
	const React = require("react");
	return {
		Alert: {
			alert: jest.fn(),
		},
		Platform: {
			OS: "ios",
			select: jest.fn((obj) => obj.ios || obj.default),
		},
		StyleSheet: {
			create: jest.fn((styles) => styles),
			flatten: jest.fn((style) => style),
		},
		View: ({ children, testID, ...props }) =>
			React.createElement("View", { testID, ...props }, children),
		Text: ({ children, testID, ...props }) =>
			React.createElement("Text", { testID, ...props }, children),
		TextInput: ({ children, testID, ...props }) =>
			React.createElement("TextInput", { testID, ...props }, children),
		TouchableOpacity: ({ children, testID, accessibilityState, ...props }) =>
			React.createElement(
				"TouchableOpacity",
				{ testID, accessibilityState, ...props },
				children,
			),
		FlatList: ({ data, renderItem, testID, ...props }) => {
			if (!data) return React.createElement("FlatList", { testID, ...props });
			return React.createElement(
				"FlatList",
				{ testID, ...props },
				data.map((item, index) => renderItem({ item, index })),
			);
		},
		ScrollView: ({ children, testID, ...props }) =>
			React.createElement("ScrollView", { testID, ...props }, children),
		ActivityIndicator: ({ testID, ...props }) =>
			React.createElement("ActivityIndicator", { testID, ...props }),
		Switch: ({ testID, ...props }) =>
			React.createElement("Switch", { testID, ...props }),
		RefreshControl: ({ testID, ...props }) =>
			React.createElement("RefreshControl", { testID, ...props }),
		KeyboardAvoidingView: ({ children, testID, ...props }) =>
			React.createElement(
				"KeyboardAvoidingView",
				{ testID, ...props },
				children,
			),
		SafeAreaView: ({ children, testID, ...props }) =>
			React.createElement("SafeAreaView", { testID, ...props }, children),
		Dimensions: {
			get: jest.fn(() => ({ width: 375, height: 667 })),
		},
		NativeModules: {},
		TurboModuleRegistry: {
			get: jest.fn(),
			getEnforcing: jest.fn(),
		},
	};
});
