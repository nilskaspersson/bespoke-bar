import { db } from "@bespoke/db";
import {
	OrganisationsTable,
	type UpdateOrganisationFormData,
	updateOrganisationSchema,
} from "@bespoke/schema/schema/organisations";
import { eq, sql } from "drizzle-orm";
import type { Auth } from "../auth";
import { cacheEvents } from "../cache";
import { rateLimit } from "../rateLimit";

export async function updateLocalOrganisation(
	auth: Auth,
	userInput: UpdateOrganisationFormData,
) {
	const { userId, orgId } = auth;

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

	cacheEvents.organisation.update.emit(orgId);

	return organisation;
}
