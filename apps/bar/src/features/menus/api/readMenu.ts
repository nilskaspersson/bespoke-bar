import { db } from "@bespoke/db";
import { MenuEntriesTable } from "@bespoke/schema/schema/menuEntries";
import { type Menu, MenusTable } from "@bespoke/schema/schema/menus";
import { and, asc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/utils/cache";

const preparedReadMenu = db.query.MenusTable.findFirst({
	where: and(
		eq(MenusTable.id, sql.placeholder("menuId")),
		eq(MenusTable.orgId, sql.placeholder("orgId")),
	),
	with: {
		entries: {
			orderBy: [asc(MenuEntriesTable.sortOrder)],
			with: {
				recipe: {
					with: {
						lines: true,
					},
				},
			},
		},
	},
}).prepare("readMenu");

/** @public */
export async function readMenu(orgId: string, id: Menu["id"]) {
	const menu = await preparedReadMenu.execute({
		menuId: id,
		orgId,
	});

	return menu;
}

export async function getCachedMenu(orgId: string, id: Menu["id"]) {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.menuWithRecipes(orgId, id));
	return await readMenu(orgId, id);
}
