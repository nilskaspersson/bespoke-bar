import { asc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { TagsTable } from "@/db/schema/tags";
import { cacheTags } from "@/utils/cache";

const preparedListTags = db.query.TagsTable.findMany({
	where: eq(TagsTable.orgId, sql.placeholder("orgId")),
	orderBy: [asc(sql`lower(${TagsTable.name})`)],
}).prepare("listTags");

async function listTags(orgId: string) {
	return await preparedListTags.execute({ orgId });
}

export async function getCachedTags(orgId: string) {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.tagsList(orgId));
	return await listTags(orgId);
}
