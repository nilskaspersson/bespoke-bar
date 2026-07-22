import type { AppRouter } from "@bespoke/api";
import { getClerkInstance } from "@clerk/expo";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import * as Application from "expo-application";
import { Platform } from "react-native";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

export const apiOrigin =
	process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

const TOKEN_TIMEOUT_MS = 5000;

/**
 * The resource cache makes clerk-js rethrow offline network errors, but only
 * after retrying a doomed token refresh for minutes — awaited here it stalls the
 * whole batch. Bound it and reject on timeout rather than send an unauthenticated
 * request that would earn a real 401.
 */
async function getSessionToken(): Promise<string | null> {
	const session = getClerkInstance().session;
	if (!session) {
		return null;
	}

	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		return await Promise.race([
			session.getToken(),
			new Promise<never>((_, reject) => {
				timer = setTimeout(
					() => reject(new Error("Clerk getToken timed out")),
					TOKEN_TIMEOUT_MS,
				);
			}),
		]);
	} finally {
		clearTimeout(timer);
	}
}

export const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${apiOrigin}/api/trpc`,
			async headers() {
				const token = await getSessionToken();
				return {
					"x-app-version": Application.nativeApplicationVersion ?? "0.0.0",
					"x-platform": Platform.OS,
					...(token ? { authorization: `Bearer ${token}` } : {}),
				};
			},
		}),
	],
});
