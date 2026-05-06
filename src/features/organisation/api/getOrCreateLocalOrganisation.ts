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
		const localOrgId = await getCachedLocalOrgId(clerkOrgId);
		return await getCachedOrganisation(localOrgId);
	} catch (error) {
		if (!(error instanceof OrganisationNotFound)) {
			throw error;
		}

		return createLocalOrganisation(clerkOrgId, userId);
	}
}

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
	localOrgId: string,
): Promise<Organisation> {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.organisation(localOrgId));

	const [organisation] = await db
		.select()
		.from(OrganisationsTable)
		.where(eq(OrganisationsTable.id, localOrgId))
		.limit(1);

	/** Throwing inside `"use cache"` skips caching for that invocation. */
	if (!organisation) {
		throw new OrganisationNotFound();
	}

	return organisation;
}

/** No cacheTag: clerkOrgId↔localId is immutable, no invalidation path exists. */
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
