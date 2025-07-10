import { eq } from "drizzle-orm";
import { db } from "@/db";
import { OrganisationsTable } from "@/db/schema/organisations";
import { authOrForbidden } from "@/utils/auth";

export async function getOrCreateLocalOrganisation() {
	const { userId, orgId } = await authOrForbidden();

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
