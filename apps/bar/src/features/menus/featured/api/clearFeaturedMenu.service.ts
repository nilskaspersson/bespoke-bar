import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { MenusTable } from "@/db/schema/menus";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function clearFeaturedMenu(auth: Auth) {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	const [menu] = await db
		.update(MenusTable)
		.set({
			isFeatured: false,
			featuredAt: null,
		})
		.where(and(eq(MenusTable.orgId, orgId), eq(MenusTable.isFeatured, true)))
		.returning();

	if (menu) {
		cacheEvents.menu.update.emit(orgId, menu.id);
	}

	return menu ?? null;
}
