import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { insertTagSchema, type Tag, TagsTable } from "@/db/schema/tags";
import { isUniqueConstraintViolation } from "@/db/utils";
import { normalizeInput, unique } from "@/utils";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export type BulkUpdateTagsInput = {
	updates: { id: string; name: string }[];
	deletes: string[];
};

export async function bulkUpdateTags(
	auth: Auth,
	input: BulkUpdateTagsInput,
): Promise<Tag[]> {
	const { userId, orgId } = auth;
	const nameSchema = insertTagSchema.pick({ name: true });

	const updates = input.updates.map((u) => ({
		id: u.id,
		name: nameSchema.parse({ name: u.name }).name,
	}));
	const deletes = unique(input.deletes);

	const proposedByNormalizedName = new Map<string, string>();
	for (const u of updates) {
		const key = normalizeInput(u.name);
		const existing = proposedByNormalizedName.get(key);
		if (existing && existing !== u.id) {
			throw new Error(`Multiple tags would be named "${u.name}"`);
		}
		proposedByNormalizedName.set(key, u.id);
	}

	const { result, applied } = await db
		.transaction(async (tx) => {
			const orgTags = await tx.query.TagsTable.findMany({
				where: eq(TagsTable.orgId, orgId),
				columns: { id: true, name: true },
			});

			const ownedIds = new Set(orgTags.map((t) => t.id));
			const liveUpdates = updates.filter((u) => ownedIds.has(u.id));
			const liveDeletes = deletes.filter((id) => ownedIds.has(id));

			if (
				(updates.length > 0 || deletes.length > 0) &&
				liveUpdates.length === 0 &&
				liveDeletes.length === 0
			) {
				throw new Error(
					"These tags are no longer in your organisation. Refresh and try again.",
				);
			}

			const skipIds = new Set([
				...liveDeletes,
				...liveUpdates.map((u) => u.id),
			]);
			for (const tag of orgTags) {
				if (skipIds.has(tag.id)) continue;
				const proposedId = proposedByNormalizedName.get(
					normalizeInput(tag.name),
				);
				if (proposedId == null) continue;
				throw new Error(`Tag name "${tag.name}" is already in use`);
			}

			if (liveDeletes.length > 0) {
				await tx
					.delete(TagsTable)
					.where(
						and(inArray(TagsTable.id, liveDeletes), eq(TagsTable.orgId, orgId)),
					);
			}

			if (liveUpdates.length > 0) {
				const cases = sql.join(
					liveUpdates.map((u) => sql`WHEN ${u.id} THEN ${u.name}`),
					sql` `,
				);
				await tx
					.update(TagsTable)
					.set({
						name: sql`CASE ${TagsTable.id} ${cases} END`,
						updatedAt: sql`NOW()`,
						updatedBy: userId,
					})
					.where(
						and(
							inArray(
								TagsTable.id,
								liveUpdates.map((u) => u.id),
							),
							eq(TagsTable.orgId, orgId),
						),
					);
			}

			const nextTags = await tx.query.TagsTable.findMany({
				where: eq(TagsTable.orgId, orgId),
				orderBy: [asc(TagsTable.name)],
			});

			return {
				result: nextTags,
				applied: { updates: liveUpdates, deletes: liveDeletes },
			};
		})
		.catch((e) => {
			if (isUniqueConstraintViolation(e, "idx_tags_org_name_unique")) {
				throw new Error(
					"A tag with that name already exists. Refresh and try again.",
				);
			}
			throw e;
		});

	for (const u of applied.updates) {
		cacheEvents.tag.update.emit(orgId, u.id);
	}
	for (const id of applied.deletes) {
		cacheEvents.tag.delete.emit(orgId, id);
	}

	return result;
}
