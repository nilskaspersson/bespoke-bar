import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import {
	type Organisation,
	OrganisationsTable,
} from "@/db/schema/organisations";
import { cacheTags } from "@/utils/cache";

class OrganisationNotFound extends Error {}

export async function getOrCreateLocalOrganisation(
	orgId: string,
	userId: string,
): Promise<Organisation> {
	try {
		return await getCachedOrganisation(orgId);
	} catch (error) {
		/**
		 * Rethrow if Error isn't OrganisationNotFound, otherwise proceed to create.
		 */
		if (!(error instanceof OrganisationNotFound)) {
			throw error;
		}

		return createLocalOrganisation(orgId, userId);
	}
}

async function createLocalOrganisation(
	orgId: string,
	userId: string,
): Promise<Organisation> {
	const [inserted] = await db
		.insert(OrganisationsTable)
		.values({
			clerkOrgId: orgId,
			createdBy: userId,
		})
		.onConflictDoNothing({ target: OrganisationsTable.clerkOrgId })
		.returning();

	if (inserted) {
		return inserted;
	}

	const [organisation] = await db
		.select()
		.from(OrganisationsTable)
		.where(eq(OrganisationsTable.clerkOrgId, orgId))
		.limit(1);

	return organisation;
}

async function getCachedOrganisation(orgId: string): Promise<Organisation> {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.organisation(orgId));

	const [organisation] = await db
		.select()
		.from(OrganisationsTable)
		.where(eq(OrganisationsTable.clerkOrgId, orgId))
		.limit(1);

	/**
	 * Throwing inside `"use cache"` skips caching for that invocation. This covers the
	 * sign-up flow where we create the local org.
	 */
	if (!organisation) {
		throw new OrganisationNotFound();
	}

	return organisation;
}
