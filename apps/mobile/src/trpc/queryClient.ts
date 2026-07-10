import { getClerkInstance } from "@clerk/expo";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";

function isUnauthorized(error: unknown): boolean {
	return (
		error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED"
	);
}

/**
 * A reachable protected query can only 401 on a genuinely dead session — the
 * route gate keeps queries from firing before an org is active. So when Clerk
 * still reports a session, tear it down; the gate then lands on `/sign-in`.
 */
async function signOutOnUnauthorized(error: unknown): Promise<void> {
	if (!isUnauthorized(error)) return;
	const clerk = getClerkInstance();
	if (clerk.session) {
		await clerk.signOut();
	}
}

export const queryClient = new QueryClient({
	queryCache: new QueryCache({ onError: signOutOnUnauthorized }),
	mutationCache: new MutationCache({ onError: signOutOnUnauthorized }),
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			retry: (failureCount, error) =>
				!isUnauthorized(error) && failureCount < 2,
		},
	},
});
