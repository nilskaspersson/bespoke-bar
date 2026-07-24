import { getClerkInstance } from "@clerk/expo";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { PERSIST_MAX_AGE } from "@/offline/persister";
import { purgeOfflineCache } from "@/offline/purge";
import { getAppErrorPayload, isUpdateRequired } from "@/trpc/appError";
import { updateRequiredStore } from "@/trpc/updateRequired";

function isUnauthorized(error: unknown): boolean {
	return (
		error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED"
	);
}

function isPreconditionFailed(error: unknown): boolean {
	return (
		error instanceof TRPCClientError &&
		error.data?.code === "PRECONDITION_FAILED"
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

/**
 * `UPDATE_REQUIRED` is global (ADR-0009): the binary is below the server's
 * floor, so every request fails the same way. This is NOT a hard wall (that
 * stays reserved for security/retirement) — the cached library keeps rendering
 * and only the refresh is refused. Flip the sticky store that shows the
 * non-blocking "update to sync" notice; leave the stale cache in place.
 */
function handleCacheError(error: unknown): void {
	if (isUpdateRequired(getAppErrorPayload(error))) {
		updateRequiredStore.getState().markRequired();
		return;
	}
	void signOutOnUnauthorized(error);
}

/**
 * Any successful response proves this binary is back above the floor (it was
 * lowered, or the request was retried after an update), so retire the notice.
 * Cheap no-op when it isn't showing.
 */
function handleCacheSuccess(): void {
	updateRequiredStore.getState().clear();
}

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: handleCacheError,
		onSuccess: handleCacheSuccess,
	}),
	mutationCache: new MutationCache({
		onError: handleCacheError,
		onSuccess: handleCacheSuccess,
	}),
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
			/**
			 * Never retry a `PRECONDITION_FAILED` (update-required): the floor is
			 * deterministic, so a retry storm would only hammer the server without
			 * ever succeeding.
			 */
			retry: (failureCount, error) =>
				!isUnauthorized(error) &&
				!isPreconditionFailed(error) &&
				failureCount < 2,
		},
	},
});
