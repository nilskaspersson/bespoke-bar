import { clerkClient } from "@clerk/nextjs/server";
import type { UserIdMap } from "@/features/organisation/types";
import { authOrForbidden } from "@/utils/auth";

export async function readOrganisationMembers() {
	const { orgId } = await authOrForbidden();
	const client = await clerkClient();

	const response = await client.organizations.getOrganizationMembershipList({
		organizationId: orgId,
	});

	return response.data.reduce<UserIdMap>((acc, member) => {
		const { publicUserData } = member;

		if (publicUserData) {
			acc[publicUserData.userId] = {
				firstName: publicUserData.firstName,
				lastName: publicUserData.lastName,
				imageUrl: publicUserData.imageUrl,
				hasImage: publicUserData.hasImage,
				identifier: publicUserData.identifier,
			};
		}

		return acc;
	}, {});
}
