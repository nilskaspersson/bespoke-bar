import { type Menu, MenusTable } from "@bespoke/schema/schema/menus";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function setFeaturedMenu(auth: Auth, menuId: Menu["id"]) {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	const [prev, next] = await db.transaction(async (tx) => {
		const [prev] = await tx
			.update(MenusTable)
			.set({
				isFeatured: false,
				featuredAt: null,
			})
			.where(and(eq(MenusTable.orgId, orgId), eq(MenusTable.isFeatured, true)))
			.returning();

		const [next] = await tx
			.update(MenusTable)
			.set({
				isFeatured: true,
				featuredAt: sql`NOW()`,
			})
			.where(and(eq(MenusTable.id, menuId), eq(MenusTable.orgId, orgId)))
			.returning();

		return [prev, next];
	});

	if (!next) {
		throw new Error("Menu not found");
	}

	cacheEvents.menu.update.emit(orgId, next.id);

	if (prev) {
		cacheEvents.menu.update.emit(orgId, prev.id);
	}

	return next;
}
