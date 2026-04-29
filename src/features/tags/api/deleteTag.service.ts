import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { type Tag, TagsTable } from "@/db/schema/tags";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function deleteTag(auth: Auth, id: Tag["id"]): Promise<void> {
	const { orgId } = auth;

	await db
		.delete(TagsTable)
		.where(and(eq(TagsTable.id, id), eq(TagsTable.orgId, orgId)));

	cacheEvents.tag.delete.emit(orgId, id);
}
