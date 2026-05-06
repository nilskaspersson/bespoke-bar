import { auth } from "@clerk/nextjs/server";
import { forbidden } from "next/navigation";
import { cache } from "react";
import { getLocalOrgId } from "@/features/organisation/api/getOrCreateLocalOrganisation";

declare const brand: unique symbol;

export type Auth = {
	userId: string;
	orgId: string;
	clerkOrgId: string;
	[brand]: true;
};

/**
 * React's `cache` is per-request. Cache the outcome of this function to avoid
 * repeating whatever `auth()` does internally, since we usually invoke
 * `authOrForbidden` several times in a render cycle.
 */
export const authOrForbidden = cache(async () => {
	const { userId, orgId: clerkOrgId } = await auth();

	if (!userId || !clerkOrgId) {
		forbidden();
	}

	const orgId = await getLocalOrgId(clerkOrgId, userId);

	return { userId, orgId, clerkOrgId } as Auth;
});
