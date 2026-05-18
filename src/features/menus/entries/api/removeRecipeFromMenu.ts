"use server";

import type { MenuEntry } from "@/db/schema/menuEntries";
import { removeRecipeFromMenu as removeRecipeFromMenuService } from "@/features/menus/entries/api/removeRecipeFromMenu.service";
import { authOrForbidden } from "@/utils/auth";

export async function removeRecipeFromMenu(
	entryId: string,
): Promise<MenuEntry> {
	const auth = await authOrForbidden();
	return removeRecipeFromMenuService(auth, entryId);
}
