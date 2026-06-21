import {
	type InsertTag,
	insertTagSchema,
	type Tag,
	TagsTable,
} from "@bespoke/schema/schema/tags";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { isUniqueConstraintViolation } from "@/db/utils";
import { MAX_TAGS_PER_ORG } from "@/features/tags/constants";
import { rateLimit } from "@/rateLimit";
import { normalizeInput } from "@/utils";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function createTag(auth: Auth, input: InsertTag): Promise<Tag> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	const validated = insertTagSchema.parse({
		...input,
		orgId,
		createdBy: userId,
	});

	const orgTags = await db.query.TagsTable.findMany({
		where: eq(TagsTable.orgId, orgId),
		columns: { name: true },
	});

	if (orgTags.length >= MAX_TAGS_PER_ORG) {
		throw new Error(
			`Tag limit reached (${MAX_TAGS_PER_ORG}). Delete unused tags before creating new ones.`,
		);
	}

	const proposed = normalizeInput(validated.name);
	const conflict = orgTags.find((t) => normalizeInput(t.name) === proposed);
	if (conflict) {
		throw new Error(`Tag name "${conflict.name}" is already in use`);
	}

	let result: Tag;
	try {
		[result] = await db.insert(TagsTable).values(validated).returning();
	} catch (error) {
		if (isUniqueConstraintViolation(error, "idx_tags_org_name_unique")) {
			throw new Error(`Tag name "${validated.name}" is already in use`);
		}
		throw error;
	}

	cacheEvents.tag.create.emit(orgId);

	return result;
}
