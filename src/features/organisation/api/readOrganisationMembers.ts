import { clerkClient } from "@clerk/nextjs/server";
import { cache } from "react";
import type { UserIdMap } from "@/features/organisation/types";
import { authOrForbidden } from "@/utils/auth";

export const readOrganisationMembers = cache(async () => {
	const { clerkOrgId } = await authOrForbidden();
	const client = await clerkClient();

	const response = await client.organizations.getOrganizationMembershipList({
		organizationId: clerkOrgId,
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
});
