"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { addRecipeToMenu as addRecipeToMenuService } from "@bespoke/api/menus/entries/addRecipeToMenu.service";
import {
	type MenuEntry,
	type MenuEntryFormData,
	menuEntryFormSchema,
} from "@bespoke/schema/schema/menuEntries";
import { parseWithZod } from "@conform-to/zod/v4";

export async function addRecipeToMenu(
	userInput: MenuEntryFormData,
): Promise<MenuEntry> {
	const auth = await authOrForbidden();
	return addRecipeToMenuService(auth, userInput);
}

export const addRecipeToMenuAction = async (formData: FormData) => {
	const submission = parseWithZod(formData, {
		schema: menuEntryFormSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	return await addRecipeToMenu(submission.value);
};
