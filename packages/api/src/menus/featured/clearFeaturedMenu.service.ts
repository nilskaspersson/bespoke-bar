import { db } from "@bespoke/db";
import { MenusTable } from "@bespoke/schema/schema/menus";
import { and, eq } from "drizzle-orm";
import type { Auth } from "../../auth";
import { cacheEvents } from "../../cache";
import { rateLimit } from "../../rateLimit";

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
