import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	type InsertTag,
	type Tag,
	TagsTable,
	updateTagSchema,
} from "@/db/schema/tags";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function updateTag(
	auth: Auth,
	id: Tag["id"],
	input: InsertTag,
): Promise<Tag> {
	const { userId, orgId } = auth;

	const validated = updateTagSchema.pick({ name: true }).parse(input);

	const [result] = await db
		.update(TagsTable)
		.set({
			...validated,
			updatedAt: sql`NOW()`,
			updatedBy: userId,
		})
		.where(and(eq(TagsTable.id, id), eq(TagsTable.orgId, orgId)))
		.returning();

	cacheEvents.tag.update.emit(orgId, id);

	return result;
}
