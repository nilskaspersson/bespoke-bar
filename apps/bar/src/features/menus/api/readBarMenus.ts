import { db } from "@bespoke/db";
import type { MenuWithEntries } from "@bespoke/schema/schema/composite";
import { MenusTable } from "@bespoke/schema/schema/menus";
import { and, desc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/utils/cache";

const preparedReadBarMenus = db.query.MenusTable.findMany({
	where: and(eq(MenusTable.orgId, sql.placeholder("orgId"))),
	with: {
		entries: true,
	},
	orderBy: [
		desc(sql`COALESCE(${MenusTable.updatedAt}, ${MenusTable.createdAt})`),
	],
}).prepare("readBarMenus");

/** @public */
export async function readBarMenus(orgId: string): Promise<MenuWithEntries[]> {
	return preparedReadBarMenus.execute({ orgId });
}

export async function getCachedMenus(orgId: string) {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.menus(orgId));
	return await readBarMenus(orgId);
}
