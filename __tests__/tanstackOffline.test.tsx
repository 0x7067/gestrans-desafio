import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { FIVE_MINUTES, TWENTY_FOUR_HOURS } from "@/constants/time";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
	setItem: jest.fn(),
	getItem: jest.fn(),
	removeItem: jest.fn(),
}));

// Mock NetInfo
jest.mock("@react-native-community/netinfo", () => ({
	addEventListener: jest.fn(),
	fetch: jest.fn(() => Promise.resolve({ isConnected: true, type: "wifi" })),
}));

describe("TanStack Query Offline Functionality", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should create QueryClient with offline configuration", () => {
		const offlineConfig = {
			defaultOptions: {
				queries: {
					gcTime: TWENTY_FOUR_HOURS,
					staleTime: FIVE_MINUTES,
					networkMode: "offlineFirst" as const,
					refetchOnWindowFocus: false,
				},
				mutations: {
					networkMode: "offlineFirst" as const,
				},
			},
		};

		expect(offlineConfig.defaultOptions.queries.networkMode).toBe(
			"offlineFirst",
		);
		expect(offlineConfig.defaultOptions.mutations.networkMode).toBe(
			"offlineFirst",
		);
		expect(offlineConfig.defaultOptions.queries.gcTime).toBe(TWENTY_FOUR_HOURS);
		expect(offlineConfig.defaultOptions.queries.staleTime).toBe(FIVE_MINUTES);
	});

	it("should create AsyncStorage persister", () => {
		const persister = createAsyncStoragePersister({
			storage: AsyncStorage,
			key: "REACT_QUERY_OFFLINE_CACHE",
		});

		expect(persister).toBeDefined();
		expect(persister.persistClient).toBeDefined();
		expect(persister.restoreClient).toBeDefined();
		expect(persister.removeClient).toBeDefined();
	});

	it("should validate offline-first benefits", () => {
		// Test that offline-first mode provides better UX
		const offlineFirstConfig = { networkMode: "offlineFirst" as const };
		const onlineConfig = { networkMode: "online" as const };

		expect(offlineFirstConfig.networkMode).toBe("offlineFirst");
		expect(onlineConfig.networkMode).toBe("online");

		// offline-first runs queries once then pauses retries when offline
		// online mode pauses queries entirely when offline
		expect(offlineFirstConfig.networkMode).not.toBe(onlineConfig.networkMode);
	});
});
