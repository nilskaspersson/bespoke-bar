import { auth } from "@clerk/nextjs/server";
import { get } from "@vercel/edge-config";
import { forbidden } from "next/navigation";
import { cache } from "react";
import { getLocalOrgId } from "@/features/organisation/api/getOrCreateLocalOrganisation";

export async function isAdminUser(userId: string): Promise<boolean> {
	const allowlist = (await get<string[]>("admin-user-ids")) ?? [];
	return allowlist.includes(userId);
}

/**
 * Admin equivalent of `authOrForbidden` from `@/utils/auth`. Forbids if the
 * caller is not signed in or not in the admin allowlist. Deliberately does
 * not require an active org context — admins act on arbitrary orgs via input,
 * not via their own Clerk org membership.
 */
export const adminOrForbidden = cache(
	async (): Promise<{
		userId: string;
		orgId: string | undefined;
		clerkOrgId: string | undefined;
	}> => {
		const { userId, orgId: clerkOrgId } = await auth();

		if (!userId || !(await isAdminUser(userId))) {
			forbidden();
		}

		const orgId = clerkOrgId
			? await getLocalOrgId(clerkOrgId, userId)
			: undefined;

		return { userId, orgId, clerkOrgId: clerkOrgId ?? undefined };
	},
);
