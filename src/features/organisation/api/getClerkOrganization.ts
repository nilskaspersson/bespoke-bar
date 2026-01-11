import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getClerkOrganization() {
	const { orgId } = await auth();

	if (!orgId) {
		return null;
	}

	const client = await clerkClient();

	const organization = await client.organizations.getOrganization({
		organizationId: orgId,
	});

	return organization;
}
