import { clerkClient } from "@clerk/nextjs/server";
import type { PublicUserData } from "@clerk/types";

export async function getUserById(id: string): Promise<PublicUserData> {
	const client = await clerkClient();
	const user = await client.users.getUser(id);

	return {
		firstName: user.firstName,
		lastName: user.lastName,
		imageUrl: user.imageUrl,
		hasImage: user.hasImage,
		/**
		 * `identifier` is technically the field a user would sign in with, f.e. email,
		 * phone, username, etc. It's not available in this data model, and I don't see any
		 * reason to attempt to derive it either, so just use the user ID for similar
		 * semantics around uniqueness.
		 */
		identifier: user.id,
	};
}
