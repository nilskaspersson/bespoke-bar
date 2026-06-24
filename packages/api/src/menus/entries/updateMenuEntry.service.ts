import { db } from "@bespoke/db";
import {
	MenuEntriesTable,
	type MenuEntry,
	menuEntryFormSchema,
	type UpdateMenuEntry,
} from "@bespoke/schema/schema/menuEntries";
import { and, eq, sql } from "drizzle-orm";
import type { Auth } from "../../auth";
import { cacheEvents } from "../../cache";
import { rateLimit } from "../../rateLimit";

export async function updateMenuEntry(
	auth: Auth,
	id: MenuEntry["id"],
	userInputData: UpdateMenuEntry,
): Promise<MenuEntry> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	const validatedUserInputData = menuEntryFormSchema.parse(userInputData);

	const [result] = await db
		.update(MenuEntriesTable)
		.set({ ...validatedUserInputData, updatedAt: sql`NOW()` })
		.where(and(eq(MenuEntriesTable.id, id), eq(MenuEntriesTable.orgId, orgId)))
		.returning();

	if (!result) {
		throw new Error("Entry not found or access denied");
	}

	cacheEvents.menu.update.emit(orgId, result.menuId);

	return result;
}
