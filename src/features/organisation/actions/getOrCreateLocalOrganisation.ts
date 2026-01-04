"use server";

import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { forbidden, redirect } from "next/navigation";
import { db } from "@/db";
import { OrganisationsTable } from "@/db/schema/organisations";

export async function getOrCreateLocalOrganisation(
	orgId: string | undefined,
	userId: string | undefined,
) {
	/**
	 * No user, no org.
	 */
	if (!userId) {
		forbidden();
	}

	/**
	 * If there's no Clerk org id, we can't create a local org. Throw a redirect to the
	 * create org page.
	 */
	if (!orgId) {
		redirect("/org/create");
	}

	const existingOrganisation = await getCachedOrganisation(orgId);

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

async function getCachedOrganisation(orgId: string) {
	"use cache";
	cacheTag(`organisation-${orgId}`);

	const [existingOrganisation] = await db
		.select()
		.from(OrganisationsTable)
		.where(eq(OrganisationsTable.clerkOrgId, orgId))
		.limit(1);

	return existingOrganisation;
}
