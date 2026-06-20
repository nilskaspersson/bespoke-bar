import { clerkClient } from "@clerk/nextjs/server";

export type OrgMemberSummary = {
	userId: string;
	name: string;
};

export async function listOrgMembers(
	clerkOrgId: string,
): Promise<OrgMemberSummary[]> {
	const client = await clerkClient();
	const { data } = await client.organizations.getOrganizationMembershipList({
		organizationId: clerkOrgId,
		limit: 100,
	});

	return data.map((membership) => {
		const user = membership.publicUserData;
		const fullName = [user?.firstName, user?.lastName]
			.filter(Boolean)
			.join(" ")
			.trim();

		return {
			userId: user?.userId ?? membership.id,
			name: fullName || user?.identifier || user?.userId || "Unknown member",
		};
	});
}
