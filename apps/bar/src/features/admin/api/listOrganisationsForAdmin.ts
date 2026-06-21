import { OrganisationsTable } from "@bespoke/schema/schema/organisations";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { collator } from "@/utils/collator";

export type AdminOrgSummary = {
	id: string;
	clerkOrgId: string;
	name: string;
	isOrphaned: boolean;
};

/**
 * Anything Clerk no longer knows is flagged orphaned.
 */
export async function listOrganisationsForAdmin(): Promise<AdminOrgSummary[]> {
	const [rows, clerkNames] = await Promise.all([
		db
			.select({
				id: OrganisationsTable.id,
				clerkOrgId: OrganisationsTable.clerkOrgId,
			})
			.from(OrganisationsTable),
		clerkOrgNames(),
	]);

	return rows
		.map((row) => {
			if (!clerkNames) {
				return {
					id: row.id,
					clerkOrgId: row.clerkOrgId,
					name: row.clerkOrgId,
					isOrphaned: false,
				};
			}

			const name = clerkNames.get(row.clerkOrgId);
			return {
				id: row.id,
				clerkOrgId: row.clerkOrgId,
				name: name ?? `(deleted) ${row.clerkOrgId}`,
				isOrphaned: name === undefined,
			};
		})
		.sort((a, b) => collator.compare(a.name, b.name));
}

async function clerkOrgNames(): Promise<Map<string, string> | null> {
	try {
		const client = await clerkClient();
		const { data } = await client.organizations.getOrganizationList({
			limit: 500,
		});
		return new Map(data.map((org) => [org.id, org.name]));
	} catch {
		return null;
	}
}
