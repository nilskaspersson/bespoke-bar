import type { MenuWithEntries } from "@/db/schema/composite";
import type { MenuEntry, MenuEntryWithRecipe } from "@/db/schema/menuEntries";
import type { Menu } from "@/db/schema/menus";
import { DEFAULT_MENU_NAME } from "@/features/menus/constants";
import { isRecipe } from "@/features/recipes/utils";
import { isObject } from "@/utils";
import { namedEntityToUrlSlug } from "@/utils/url";

export function generateDefaultMenuName() {
	return `Menu ${new Date().toLocaleString()}`;
}

export function getMenuUrl(menu: Menu) {
	return `/bar/menus/${menu.id}/${namedEntityToUrlSlug(menu)}`;
}

export function isMenuEntry(o: unknown): o is MenuEntry {
	return (
		isObject(o) && Object.hasOwn(o, "recipeId") && Object.hasOwn(o, "menuId")
	);
}

export function isMenu(o: unknown): o is Menu {
	return (
		isObject(o) && Object.hasOwn(o, "name") && Object.hasOwn(o, "isFeatured")
	);
}

export function isMenuWithEntries(o: unknown): o is MenuWithEntries {
	return isMenu(o) && Object.hasOwn(o, "entries");
}

/**
 * For preview purposes. Returns null if there's no recipe.
 */
export function createDraftMenuEntry(
	o: Partial<MenuEntryWithRecipe>,
): MenuEntryWithRecipe | null {
	if (!isRecipe(o.recipe)) {
		return null;
	}

	return {
		id: "",
		orgId: "",
		menuId: "",
		recipe: o.recipe,
		recipeId: o.recipe.id,
		price: null,
		createdAt: new Date().toISOString(),
		updatedAt: null,
		sortOrder: null,
		...o,
	};
}

export function getMenuName(menu: Menu) {
	return menu.name ?? DEFAULT_MENU_NAME;
}
