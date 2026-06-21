"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { updateMenuEntry as updateMenuEntryService } from "@bespoke/api/menus/entries/updateMenuEntry.service";
import {
	type MenuEntry,
	menuEntryFormSchema,
	type UpdateMenuEntry,
} from "@bespoke/schema/schema/menuEntries";
import { parseWithZod } from "@conform-to/zod/v4";

export async function updateMenuEntry(
	id: MenuEntry["id"],
	userInputData: UpdateMenuEntry,
): Promise<MenuEntry> {
	const auth = await authOrForbidden();
	return updateMenuEntryService(auth, id, userInputData);
}

export const updateMenuEntryAction = async (
	id: MenuEntry["id"],
	formData: FormData,
) => {
	const submission = parseWithZod(formData, {
		schema: menuEntryFormSchema,
	});

	if (submission.status !== "success" || !id) {
		return submission.reply();
	}

	/**
	 * Conform converts empty strings to undefined. Convert undefined back to null for
	 * the fields we want to allow users to clear.
	 */
	const patchData = {
		...submission.value,
		price: submission.value.price ?? null,
	};

	const result = await updateMenuEntry(id, patchData);

	return result;
};
