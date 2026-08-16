import { ClerkProvider } from "@clerk/expo";
import { resourceCache } from "@clerk/expo/resource-cache";
import { tokenCache } from "@clerk/expo/token-cache";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Slot, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { View } from "react-native";
import {
	initialWindowMetrics,
	SafeAreaProvider,
} from "react-native-safe-area-context";
import "@/offline/online";
import "@/theme/preference";
import { UpdateBanner } from "@/components/UpdateBanner";
import { persistOptions } from "@/offline/persister";
import { useResolvedTheme, useTheme } from "@/theme";
import { navigationThemes } from "@/theme/navigation";
import { TRPCProvider, trpcClient } from "@/trpc/client";
import { queryClient } from "@/trpc/queryClient";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
	const theme = useTheme();
	const resolvedTheme = useResolvedTheme();

	useEffect(() => {
		SystemUI.setBackgroundColorAsync(theme.colors.background);
	}, [theme]);

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
						<ThemeProvider value={navigationThemes[resolvedTheme]}>
							<View
								style={{ flex: 1, backgroundColor: theme.colors.background }}
							>
								<UpdateBanner />
								<View style={{ flex: 1 }}>
									<Slot />
								</View>
							</View>
							<StatusBar style="auto" />
						</ThemeProvider>
					</TRPCProvider>
				</PersistQueryClientProvider>
			</SafeAreaProvider>
		</ClerkProvider>
	);
}
