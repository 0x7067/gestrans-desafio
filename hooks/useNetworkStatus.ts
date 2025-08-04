import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

/**
 * Interface for network status information
 */
export interface NetworkStatus {
	/** Whether the device is currently online */
	isOnline: boolean;
	/** Type of network connection (wifi, cellular, etc.) */
	connectionType: string;
	/** Whether the network status is currently being determined */
	isLoading: boolean;
	/** Error if network status detection failed */
	error: Error | null;
}

/**
 * Hook for monitoring network connectivity status
 * @returns {NetworkStatus} Current network status information
 *
 * @example
 * ```tsx
 * const { isOnline, connectionType, isLoading, error } = useNetworkStatus();
 *
 * if (isLoading) {
 *   return <LoadingIndicator />;
 * }
 *
 * if (!isOnline) {
 *   return <OfflineBanner />;
 * }
 * ```
 */
export function useNetworkStatus(): NetworkStatus {
	const [isOnline, setIsOnline] = useState<boolean>(true);
	const [connectionType, setConnectionType] = useState<string>("unknown");
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let isMounted = true;

		const handleNetworkState = (state: NetInfoState) => {
			if (!isMounted) return;

			try {
				setIsOnline(state.isConnected ?? false);
				setConnectionType(state.type);
				setError(null);
			} catch (err) {
				if (isMounted) {
					setError(
						err instanceof Error ? err : new Error("Network status error"),
					);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		const unsubscribe = NetInfo.addEventListener(handleNetworkState);

		// Get initial network state
		NetInfo.fetch()
			.then(handleNetworkState)
			.catch((err) => {
				if (isMounted) {
					setError(
						err instanceof Error
							? err
							: new Error("Failed to fetch network status"),
					);
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
			unsubscribe();
		};
	}, []);

	return {
		isOnline,
		connectionType,
		isLoading,
		error,
	};
}
