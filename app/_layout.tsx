import { FIVE_MINUTES, TWENTY_FOUR_HOURS } from "@/constants/time";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: TWENTY_FOUR_HOURS,
			staleTime: FIVE_MINUTES,
			networkMode: "offlineFirst", // Enable offline-first mode
			refetchOnWindowFocus: false,
		},
		mutations: {
			networkMode: "offlineFirst", // Enable offline-first mode for mutations
		},
	},
});

const persister = createAsyncStoragePersister({
	storage: AsyncStorage,
	key: "REACT_QUERY_OFFLINE_CACHE",
});

export default function RootLayout() {
	return (
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{ persister }}
		>
			<SafeAreaProvider>
				<Stack>
					<Stack.Screen
						name="index"
						options={{
							title: "Tasks",
							headerShown: false,
						}}
					/>
					<Stack.Screen
						name="task-form"
						options={{
							title: "Task",
							presentation: "modal",
							headerBackTitle: "Cancel",
						}}
					/>
				</Stack>
			</SafeAreaProvider>
		</PersistQueryClientProvider>
	);
}
