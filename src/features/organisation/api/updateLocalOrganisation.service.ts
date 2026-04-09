import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	OrganisationsTable,
	type UpdateOrganisationFormData,
	updateOrganisationSchema,
} from "@/db/schema/organisations";
import type { Auth } from "@/utils/auth";

export async function updateLocalOrganisation(
	auth: Auth,
	userInput: UpdateOrganisationFormData,
) {
	const validatedInput = updateOrganisationSchema.parse(userInput);

	const [organisation] = await db
		.update(OrganisationsTable)
		.set({
			...validatedInput,
			updatedAt: sql`NOW()`,
		})
		.where(eq(OrganisationsTable.clerkOrgId, auth.orgId))
		.returning();

	return organisation;
}
