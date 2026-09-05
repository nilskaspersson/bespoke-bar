// Offline Dev Auth server stub. See docs/offline.md.
import { NextResponse } from "next/server";

const offlineDevAuth = process.env.NEXT_PUBLIC_OFFLINE_DEV_AUTH;
const userId = process.env.OFFLINE_DEV_AUTH_USER_ID ?? "user_offlinelocaldev";
const clerkOrgId =
	offlineDevAuth && offlineDevAuth !== "1"
		? offlineDevAuth
		: "org_offlinelocaldev";
const firstName = process.env.OFFLINE_DEV_AUTH_FIRST_NAME ?? "Local";
const lastName = process.env.OFFLINE_DEV_AUTH_LAST_NAME ?? "Dev";
const email = process.env.OFFLINE_DEV_AUTH_EMAIL ?? "offline@localhost.dev";

const session = { userId, orgId: clerkOrgId };

export const auth = Object.assign(async () => session, {
	protect: async () => session,
});

export async function currentUser() {
	return {
		id: userId,
		firstName,
		lastName,
		imageUrl: "",
		hasImage: false,
		primaryEmailAddress: { emailAddress: email },
		emailAddresses: [{ emailAddress: email }],
		publicMetadata: {} as Record<string, unknown>,
	};
}

const offlineClient = {
	users: {
		getUser: async (id: string) => ({
			id,
			firstName,
			lastName,
			imageUrl: "",
			hasImage: false,
		}),
		updateUserMetadata: async () => ({}),
	},
	organizations: {
		getOrganization: async () => ({
			id: clerkOrgId,
			name: "Offline",
			slug: "offline",
		}),
		getOrganizationList: async () => ({ data: [], totalCount: 0 }),
		getOrganizationMembershipList: async () => ({ data: [], totalCount: 0 }),
		deleteOrganization: async () => ({}),
	},
};

export async function clerkClient() {
	return offlineClient;
}

export function clerkMiddleware() {
	return () => NextResponse.next();
}
