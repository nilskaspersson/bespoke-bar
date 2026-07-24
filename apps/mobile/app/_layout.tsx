import { ClerkProvider } from "@clerk/expo";
import { resourceCache } from "@clerk/expo/resource-cache";
import { tokenCache } from "@clerk/expo/token-cache";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Slot } from "expo-router";
import { View } from "react-native";
import {
	initialWindowMetrics,
	SafeAreaProvider,
} from "react-native-safe-area-context";
import "@/offline/online";
import { UpdateBanner } from "@/components/UpdateBanner";
import { persistOptions } from "@/offline/persister";
import { TRPCProvider, trpcClient } from "@/trpc/client";
import { queryClient } from "@/trpc/queryClient";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
	if (!publishableKey) {
		throw new Error(
			"Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — add it to apps/mobile/.env",
		);
	}

	return (
		<ClerkProvider
			publishableKey={publishableKey}
			tokenCache={tokenCache}
			__experimental_resourceCache={resourceCache}
		>
			<SafeAreaProvider initialMetrics={initialWindowMetrics}>
				<PersistQueryClientProvider
					client={queryClient}
					persistOptions={persistOptions}
				>
					<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
						<View style={{ flex: 1 }}>
							<UpdateBanner />
							<View style={{ flex: 1 }}>
								<Slot />
							</View>
						</View>
					</TRPCProvider>
				</PersistQueryClientProvider>
			</SafeAreaProvider>
		</ClerkProvider>
	);
}
