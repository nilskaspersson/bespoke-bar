import type { AppRouter } from "@bespoke/api";
import { getClerkInstance } from "@clerk/expo";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import * as Application from "expo-application";
import { Platform } from "react-native";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

export const apiOrigin =
	process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${apiOrigin}/api/trpc`,
			async headers() {
				const token = await getClerkInstance().session?.getToken();
				return {
					"x-app-version": Application.nativeApplicationVersion ?? "0.0.0",
					"x-platform": Platform.OS,
					...(token ? { authorization: `Bearer ${token}` } : {}),
				};
			},
		}),
	],
});
