import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { focusManager, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import { AppState } from "react-native";
import {
	initialWindowMetrics,
	SafeAreaProvider,
} from "react-native-safe-area-context";
import { TRPCProvider, trpcClient } from "@/trpc/client";
import { queryClient } from "@/trpc/queryClient";

AppState.addEventListener("change", (status) =>
	focusManager.setFocused(status === "active"),
);

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
	if (!publishableKey) {
		throw new Error(
			"Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — add it to apps/mobile/.env",
		);
	}

	return (
		<ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
			<SafeAreaProvider initialMetrics={initialWindowMetrics}>
				<QueryClientProvider client={queryClient}>
					<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
						<Slot />
					</TRPCProvider>
				</QueryClientProvider>
			</SafeAreaProvider>
		</ClerkProvider>
	);
}
