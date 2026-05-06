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
	clerkOrgId: string,
	userId: string,
): Promise<Organisation> {
	try {
		return await getCachedOrganisation(clerkOrgId);
	} catch (error) {
		/**
		 * Rethrow if Error isn't OrganisationNotFound, otherwise proceed to create.
		 */
		if (!(error instanceof OrganisationNotFound)) {
			throw error;
		}

		return createLocalOrganisation(clerkOrgId, userId);
	}
}

/**
 * Auth-path translation from Clerk org id to our local id. The mapping is
 * immutable for the lifetime of the row, so this cache entry never needs to
 * invalidate — settings updates only bust `getCachedOrganisation`, leaving
 * this one warm forever.
 *
 * Splitting it from the full-row lookup means `authOrForbidden` (called on
 * every protected request) doesn't get punished by org settings updates, and
 * the cache entry is tiny.
 */
export async function getLocalOrgId(
	clerkOrgId: string,
	userId: string,
): Promise<string> {
	try {
		return await getCachedLocalOrgId(clerkOrgId);
	} catch (error) {
		if (!(error instanceof OrganisationNotFound)) {
			throw error;
		}

		const created = await createLocalOrganisation(clerkOrgId, userId);
		return created.id;
	}
}

async function createLocalOrganisation(
	clerkOrgId: string,
	userId: string,
): Promise<Organisation> {
	const [inserted] = await db
		.insert(OrganisationsTable)
		.values({
			clerkOrgId,
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
		.where(eq(OrganisationsTable.clerkOrgId, clerkOrgId))
		.limit(1);

	return organisation;
}

async function getCachedOrganisation(
	clerkOrgId: string,
): Promise<Organisation> {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.organisation(clerkOrgId));

	const [organisation] = await db
		.select()
		.from(OrganisationsTable)
		.where(eq(OrganisationsTable.clerkOrgId, clerkOrgId))
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

async function getCachedLocalOrgId(clerkOrgId: string): Promise<string> {
	"use cache";
	cacheLife("max");

	const [row] = await db
		.select({ id: OrganisationsTable.id })
		.from(OrganisationsTable)
		.where(eq(OrganisationsTable.clerkOrgId, clerkOrgId))
		.limit(1);

	if (!row) {
		throw new OrganisationNotFound();
	}

	return row.id;
}
