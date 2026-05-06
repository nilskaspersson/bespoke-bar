import { eq } from "drizzle-orm";
import { db } from "@/db";
import { OrganisationsTable } from "@/db/schema/organisations";
import { cacheEvents } from "@/utils/cache";

export class InvalidLocalOrgIdError extends Error {
	constructor(public readonly value: unknown) {
		super(`Invalid local org id: ${JSON.stringify(value)}`);
		this.name = "InvalidLocalOrgIdError";
	}
}

export type DeleteLocalOrganisationResult = {
	deletedId: string | null;
	deletedClerkOrgId: string | null;
};

/**
 * Idempotent: a missing row returns nulls. FK cascades fan the delete out to
 * every org-scoped entity.
 */
export async function deleteLocalOrganisation(
	localOrgId: unknown,
): Promise<DeleteLocalOrganisationResult> {
	if (typeof localOrgId !== "string" || localOrgId.length === 0) {
		throw new InvalidLocalOrgIdError(localOrgId);
	}

	const deleted = await db
		.delete(OrganisationsTable)
		.where(eq(OrganisationsTable.id, localOrgId))
		.returning({
			id: OrganisationsTable.id,
			clerkOrgId: OrganisationsTable.clerkOrgId,
		});

	if (deleted.length > 1) {
		console.error("deleteLocalOrganisation affected multiple rows", {
			localOrgId,
			deletedIds: deleted.map((row) => row.id),
		});
	}

	const row = deleted[0];

	if (row) {
		/**
		 * Flip the clerkOrgId → localOrgId mapping cache so a stale session
		 * token can't trigger a ghost bootstrap before its JWT refreshes.
		 */
		cacheEvents.organisation.delete.emit(row.clerkOrgId);
	}

	return {
		deletedId: row?.id ?? null,
		deletedClerkOrgId: row?.clerkOrgId ?? null,
	};
}
