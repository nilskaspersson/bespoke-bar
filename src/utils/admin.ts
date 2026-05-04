import { auth } from "@clerk/nextjs/server";
import { forbidden } from "next/navigation";
import { cache } from "react";

export function isAdminUser(userId: string): boolean {
	const allowlist = (process.env.ADMIN_USER_IDS ?? "")
		.split(",")
		.map((id) => id.trim())
		.filter(Boolean);

	return allowlist.includes(userId);
}

/**
 * Admin equivalent of `authOrForbidden` from `@/utils/auth`. Forbids if the
 * caller is not signed in or not in the admin allowlist. Deliberately does
 * not require an active org context — admins act on arbitrary orgs via input,
 * not via their own Clerk org membership.
 */
export const adminOrForbidden = cache(
	async (): Promise<{ userId: string; orgId: string | undefined }> => {
		const { userId, orgId } = await auth();

		if (!userId || !isAdminUser(userId)) {
			forbidden();
		}

		return { userId, orgId };
	},
);
