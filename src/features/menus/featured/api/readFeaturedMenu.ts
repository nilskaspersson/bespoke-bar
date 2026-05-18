import { and, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { MenusTable } from "@/db/schema/menus";
import { cacheEvents, cacheTags } from "@/utils/cache";

const readFeaturedMenuPrepared = db.query.MenusTable.findFirst({
	where: and(
		eq(MenusTable.orgId, sql.placeholder("orgId")),
		eq(MenusTable.isFeatured, true),
	),
	with: {
		entries: {
			with: {
				recipe: {
					with: {
						specs: true,
					},
				},
			},
		},
	},
}).prepare("readFeaturedMenu");

export async function readFeaturedMenu(orgId: string) {
	return await readFeaturedMenuPrepared.execute({ orgId });
}

export async function getCachedFeaturedMenu(orgId: string) {
	"use cache";
	cacheLife("max");
	const menu = await readFeaturedMenu(orgId);
	cacheTag(...cacheTags.menuWithRecipes(orgId, menu?.id));
	return menu;
}

const readFeaturedMenuIdPrepared = db.query.MenusTable.findFirst({
	where: and(
		eq(MenusTable.orgId, sql.placeholder("orgId")),
		eq(MenusTable.isFeatured, true),
	),
	columns: { id: true },
}).prepare("readFeaturedMenuId");

export async function getCachedFeaturedMenuId(orgId: string) {
	"use cache";
	cacheLife("max");
	cacheTag(
		cacheEvents.menu.create.tag(orgId),
		cacheEvents.menu.update.tag(orgId),
		cacheEvents.menu.delete.tag(orgId),
	);
	const row = await readFeaturedMenuIdPrepared.execute({ orgId });
	return row?.id ?? null;
}
