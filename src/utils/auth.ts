import { auth } from "@clerk/nextjs/server";
import { forbidden } from "next/navigation";

export async function authOrForbidden() {
	const { userId, orgId } = await auth();

	if (!userId || !orgId) {
		forbidden();
	}

	return { userId, orgId };
}
