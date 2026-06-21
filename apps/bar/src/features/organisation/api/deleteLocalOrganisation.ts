"use server";

import { adminOrForbidden } from "@bespoke/api/admin";
import {
	type DeleteLocalOrganisationResult,
	deleteLocalOrganisation,
} from "@bespoke/api/organisation/deleteLocalOrganisation.service";
import { db } from "@bespoke/db";
import { OrganisationsTable } from "@bespoke/schema/schema/organisations";
import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

const inputSchema = z.object({
	localOrgId: z.string().min(1),
});

export async function deleteLocalOrganisationAction(
	input: unknown,
): Promise<DeleteLocalOrganisationResult> {
	await adminOrForbidden();
	const { localOrgId } = inputSchema.parse(input);

	const [row] = await db
		.select({
			id: OrganisationsTable.id,
			clerkOrgId: OrganisationsTable.clerkOrgId,
		})
		.from(OrganisationsTable)
		.where(eq(OrganisationsTable.id, localOrgId))
		.limit(1);

	if (!row) {
		return { deletedId: null, deletedClerkOrgId: null };
	}

	/**
	 * Orphan-only: refuse if Clerk still has the org. Lives in the action —
	 * not the service — so the webhook bypasses it. Fails closed on any
	 * non-404 Clerk error.
	 */
	if (await clerkOrganisationExists(row.clerkOrgId)) {
		throw new Error(
			`Refusing to delete: Clerk organization ${row.clerkOrgId} still exists. ` +
				`Delete it via Clerk's UI first — the webhook will clean up local data automatically. ` +
				`This form is for orphan cleanup only.`,
		);
	}

	return deleteLocalOrganisation(localOrgId);
}

async function clerkOrganisationExists(clerkOrgId: string): Promise<boolean> {
	const client = await clerkClient();

	try {
		await client.organizations.getOrganization({
			organizationId: clerkOrgId,
		});
		return true;
	} catch (error) {
		if (
			error !== null &&
			typeof error === "object" &&
			"status" in error &&
			error.status === 404
		) {
			return false;
		}
		throw error;
	}
}
