import { auth } from "@clerk/nextjs/server";
import { forbidden } from "next/navigation";
import { cache } from "react";

/**
 * React's `cache` is per-request. Cache the outcome of this function to avoid
 * repeating whatever `auth()` does internally, since we usually invoke
 * `authOrForbidden` several times in a render cycle.
 */
export const authOrForbidden = cache(async () => {
	const { userId, orgId } = await auth();

	if (!userId || !orgId) {
		forbidden();
	}

	return { userId, orgId };
});
