import type { AppRouter } from "@bespoke/api";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import * as Application from "expo-application";
import { Platform } from "react-native";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${baseUrl}/api/trpc`,
			headers() {
				return {
					"x-app-version": Application.nativeApplicationVersion ?? "0.0.0",
					"x-platform": Platform.OS,
				};
			},
		}),
	],
});
