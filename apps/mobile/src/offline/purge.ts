import type { QueryClient } from "@tanstack/react-query";
import { clearCachedSession } from "./cachedSession";
import { persister } from "./persister";

export function purgeOfflineCache(queryClient: QueryClient): void {
	clearCachedSession();
	queryClient.clear();
	void persister.removeClient();
}
