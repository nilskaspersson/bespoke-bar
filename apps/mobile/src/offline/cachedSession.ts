import type { QueryClient } from "@tanstack/react-query";
import { persister } from "./persister";
import { offlineAuthStorage } from "./storage";

const SESSION_KEY = "cached-session";

/**
 * The persisted query keys carry neither user nor org, and favourites are
 * user-scoped, so a device that becomes active as a different user or in a
 * different org must drop the previous session's cache before it renders.
 */
export function reconcileCachedSession(
	userId: string,
	orgId: string,
	queryClient: QueryClient,
): void {
	const current = `${userId}:${orgId}`;
	const cached = offlineAuthStorage.getString(SESSION_KEY);
	if (cached && cached !== current) {
		queryClient.clear();
		void persister.removeClient();
	}
	offlineAuthStorage.set(SESSION_KEY, current);
}

export function clearCachedSession(): void {
	offlineAuthStorage.remove(SESSION_KEY);
}
