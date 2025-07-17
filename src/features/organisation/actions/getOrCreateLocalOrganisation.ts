import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { forbidden } from "next/navigation";
import { db } from "@/db";
import { OrganisationsTable } from "@/db/schema/organisations";

export async function getOrCreateLocalOrganisation() {
	const { userId, orgId } = await auth();

	/**
	 * No user, no org.
	 */
	if (!userId) {
		forbidden();
	}

	/**
	 * If there's no Clerk org id, we can't create a local org. Return null, then
	 * implementing component can decide what to do.
	 */
	if (!orgId) {
		return null;
	}

	const [existingOrganisation] = await db
		.select()
		.from(OrganisationsTable)
		.where(eq(OrganisationsTable.clerkOrgId, orgId))
		.limit(1);

	if (existingOrganisation) {
		return existingOrganisation;
	}

	const [newOrganisation] = await db
		.insert(OrganisationsTable)
		.values({
			clerkOrgId: orgId,
			createdBy: userId,
		})
		.returning();

	return newOrganisation;
}
