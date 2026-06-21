import { type Menu, MenusTable } from "@bespoke/schema/schema/menus";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function deleteMenu(auth: Auth, id: Menu["id"]): Promise<void> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	await db
		.delete(MenusTable)
		.where(and(eq(MenusTable.id, id), eq(MenusTable.orgId, orgId)));

	cacheEvents.menu.delete.emit(orgId, id);
}
