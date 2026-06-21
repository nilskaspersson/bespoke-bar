"use server";

import {
	type MenuEntry,
	type MenuEntryFormData,
	menuEntryFormSchema,
} from "@bespoke/schema/schema/menuEntries";
import { parseWithZod } from "@conform-to/zod/v4";
import { addRecipeToMenu as addRecipeToMenuService } from "@/features/menus/entries/api/addRecipeToMenu.service";
import { authOrForbidden } from "@/utils/auth";

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
