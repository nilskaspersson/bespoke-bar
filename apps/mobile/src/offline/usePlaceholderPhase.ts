import {
	type FetchStatus,
	type QueryStatus,
	useIsRestoring,
} from "@tanstack/react-query";

type PlaceholderPhase = "blank" | "loading" | "offline" | "settled";

/**
 * The persisted cache restores in an effect, so the first painted frame has an
 * empty cache — render nothing rather than a spinner that a hydrated list would
 * immediately replace. A query paused with no data will never fetch, so it reads
 * as offline, not loading. Everything else — success or error — is settled and
 * the caller decides what an empty result means.
 */
export function usePlaceholderPhase(
	status: QueryStatus,
	fetchStatus: FetchStatus,
): PlaceholderPhase {
	const isRestoring = useIsRestoring();

	if (isRestoring) {
		return "blank";
	}

	if (status === "pending" && fetchStatus === "paused") {
		return "offline";
	}

	if (status === "pending") {
		return "loading";
	}

	return "settled";
}
