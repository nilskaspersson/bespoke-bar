import { focusManager, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { AppState } from "react-native";
import { TRPCProvider, trpcClient } from "../src/trpc/client";
import { queryClient } from "../src/trpc/queryClient";

AppState.addEventListener("change", (status) =>
	focusManager.setFocused(status === "active"),
);

export default function RootLayout() {
	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				<Stack />
			</TRPCProvider>
		</QueryClientProvider>
	);
}
