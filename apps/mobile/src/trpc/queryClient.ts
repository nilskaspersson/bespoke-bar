import { getClerkInstance } from "@clerk/expo";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { PERSIST_MAX_AGE } from "@/offline/persister";
import { purgeOfflineCache } from "@/offline/purge";

function isUnauthorized(error: unknown): boolean {
	return (
		error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED"
	);
}

/**
 * A reachable protected query can only 401 on a genuinely dead session — the
 * route gate keeps queries from firing before an org is active. So when Clerk
 * still reports a session, tear it down; the gate then lands on `/sign-in`.
 * Purge like every other sign-out path so the next user never inherits the
 * previous one's user-scoped cache (favourites) on a shared device.
 */
async function signOutOnUnauthorized(error: unknown): Promise<void> {
	if (!isUnauthorized(error)) return;
	const clerk = getClerkInstance();
	if (clerk.session) {
		await clerk.signOut();
		purgeOfflineCache(queryClient);
	}
}

export const queryClient = new QueryClient({
	queryCache: new QueryCache({ onError: signOutOnUnauthorized }),
	mutationCache: new MutationCache({ onError: signOutOnUnauthorized }),
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			/**
			 * Must track the persister's maxAge. A query garbage-collected from
			 * memory is dropped from the next dehydration, which would silently
			 * shrink the persisted cache to whatever was recently on screen — and
			 * the default gcTime is five minutes.
			 */
			gcTime: PERSIST_MAX_AGE,
			retry: (failureCount, error) =>
				!isUnauthorized(error) && failureCount < 2,
		},
	},
});
