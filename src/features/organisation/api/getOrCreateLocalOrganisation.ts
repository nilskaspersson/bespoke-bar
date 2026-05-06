import { eq } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { after } from "next/server";
import { db } from "@/db";
import {
	type Organisation,
	OrganisationsTable,
} from "@/db/schema/organisations";
import { cacheTags } from "@/utils/cache";

/**
 * Throwing inside `"use cache"` doesn't propagate cleanly through user-land
 * try/catch in production server-component renders — React intercepts the
 * throw and re-emits a wrapped render error before the caller sees it. So
 * we cache `null` for "no row yet" and flip via `revalidateTag` from the
 * bootstrap path.
 */
const orgMappingTag = (clerkOrgId: string) =>
	`organisation-mapping:${clerkOrgId}`;

export async function getOrCreateLocalOrganisation(
	clerkOrgId: string,
	userId: string,
): Promise<Organisation> {
	const localOrgId = await getCachedLocalOrgId(clerkOrgId);

	if (localOrgId) {
		const cached = await getCachedOrganisation(localOrgId);
		if (cached) {
			return cached;
		}
	}

	return createLocalOrganisation(clerkOrgId, userId);
}

export async function getLocalOrgId(
	clerkOrgId: string,
	userId: string,
): Promise<string> {
	const cached = await getCachedLocalOrgId(clerkOrgId);
	if (cached) {
		return cached;
	}

	const created = await createLocalOrganisation(clerkOrgId, userId);
	return created.id;
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

	let organisation: Organisation | undefined = inserted;

	if (!organisation) {
		const [selected] = await db
			.select()
			.from(OrganisationsTable)
			.where(eq(OrganisationsTable.clerkOrgId, clerkOrgId))
			.limit(1);
		organisation = selected;
	}

	if (!organisation) {
		throw new Error(
			`createLocalOrganisation: no row for ${clerkOrgId} after insert+select`,
		);
	}

	/** Flip the cached `null` to a hit on the next request. */
	after(() => {
		updateTag(orgMappingTag(clerkOrgId));
	});

	return organisation;
}

async function getCachedOrganisation(
	localOrgId: string,
): Promise<Organisation | null> {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.organisation(localOrgId));

	const [organisation] = await db
		.select()
		.from(OrganisationsTable)
		.where(eq(OrganisationsTable.id, localOrgId))
		.limit(1);

	return organisation ?? null;
}

async function getCachedLocalOrgId(clerkOrgId: string): Promise<string | null> {
	"use cache";
	cacheLife("max");
	cacheTag(orgMappingTag(clerkOrgId));

	const [row] = await db
		.select({ id: OrganisationsTable.id })
		.from(OrganisationsTable)
		.where(eq(OrganisationsTable.clerkOrgId, clerkOrgId))
		.limit(1);

	return row?.id ?? null;
}
