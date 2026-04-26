import { db } from "@/db";
import {
	type InsertTag,
	insertTagSchema,
	type Tag,
	TagsTable,
} from "@/db/schema/tags";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function createTag(auth: Auth, input: InsertTag): Promise<Tag> {
	const { userId, orgId } = auth;

	const validated = insertTagSchema.parse({
		...input,
		orgId,
		createdBy: userId,
	});

	const [result] = await db.insert(TagsTable).values(validated).returning();

	cacheEvents.tag.create.emit(orgId);

	return result;
}
