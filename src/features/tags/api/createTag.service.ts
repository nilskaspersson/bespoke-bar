import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import {
	type InsertTag,
	insertTagSchema,
	type Tag,
	TagsTable,
} from "@/db/schema/tags";
import { MAX_TAGS_PER_ORG } from "@/features/tags/constants";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function createTag(auth: Auth, input: InsertTag): Promise<Tag> {
	const { userId, orgId } = auth;

	const validated = insertTagSchema.parse({
		...input,
		orgId,
		createdBy: userId,
	});

	const [{ count: existing }] = await db
		.select({ count: count() })
		.from(TagsTable)
		.where(eq(TagsTable.orgId, orgId));

	if (existing >= MAX_TAGS_PER_ORG) {
		throw new Error(
			`Tag limit reached (${MAX_TAGS_PER_ORG}). Delete unused tags before creating new ones.`,
		);
	}

	const [result] = await db.insert(TagsTable).values(validated).returning();

	cacheEvents.tag.create.emit(orgId);

	return result;
}
