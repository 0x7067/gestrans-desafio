import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout() {
	return (
		<QueryClientProvider client={queryClient}>
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
		</QueryClientProvider>
	);
}
