import { auth, clerkClient } from "@clerk/nextjs/server";
import { cache } from "react";

export const getClerkOrganization = cache(async () => {
	const { orgId } = await auth();

	if (!orgId) {
		return null;
	}

	const client = await clerkClient();

	const organization = await client.organizations.getOrganization({
		organizationId: orgId,
	});

	return organization;
});
