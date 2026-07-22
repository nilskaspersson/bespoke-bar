import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { defaultShouldDehydrateQuery, type Query } from "@tanstack/react-query";
import * as Application from "expo-application";
import { mmkvPersisterStorage } from "./storage";

export const PERSIST_MAX_AGE = 1000 * 60 * 60 * 24 * 30;

export const persister = createSyncStoragePersister({
	storage: mmkvPersisterStorage,
});

export const persistOptions = {
	persister,
	maxAge: PERSIST_MAX_AGE,
	buster: `${Application.nativeApplicationVersion}-${Application.nativeBuildVersion}`,
	dehydrateOptions: {
		/**
		 * A failed refetch flips a query to status "error" even while its data is
		 * still in memory, and the default filter keeps only "success" — so a
		 * single failed refresh would drop the whole library from disk. Persist
		 * anything holding data so a stale library survives an unreachable server.
		 */
		shouldDehydrateQuery(query: Query) {
			if ((query.queryKey[0] as string[] | undefined)?.[0] === "admin") {
				return false;
			}
			return (
				defaultShouldDehydrateQuery(query) || query.state.data !== undefined
			);
		},
		shouldDehydrateMutation: () => false,
	},
};
