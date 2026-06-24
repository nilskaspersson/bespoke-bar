"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { removeRecipeFromMenu as removeRecipeFromMenuService } from "@bespoke/api/menus/entries/removeRecipeFromMenu.service";
import type { MenuEntry } from "@bespoke/schema/schema/menuEntries";

export async function removeRecipeFromMenu(
	entryId: string,
): Promise<MenuEntry> {
	const auth = await authOrForbidden();
	return removeRecipeFromMenuService(auth, entryId);
}
