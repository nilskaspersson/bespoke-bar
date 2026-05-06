import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	OrganisationsTable,
	type UpdateOrganisationFormData,
	updateOrganisationSchema,
} from "@/db/schema/organisations";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function updateLocalOrganisation(
	auth: Auth,
	userInput: UpdateOrganisationFormData,
) {
	const { userId, orgId, clerkOrgId } = auth;

	await rateLimit(userId);

	const validatedInput = updateOrganisationSchema.parse(userInput);

	const [organisation] = await db
		.update(OrganisationsTable)
		.set({
			...validatedInput,
			updatedAt: sql`NOW()`,
		})
		.where(eq(OrganisationsTable.id, orgId))
		.returning();

	/**
	 * Emit by clerkOrgId (not local id) because `getCachedOrganisation` is keyed by it.
	 */
	cacheEvents.organisation.update.emit(clerkOrgId);

	return organisation;
}
