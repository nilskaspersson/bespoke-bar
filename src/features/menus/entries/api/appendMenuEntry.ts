"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import {
	type MenuWithEntries,
	type MenuWithEntriesFormData,
	menuWithEntriesFormSchema,
} from "@/db/schema/composite";
import { appendMenuEntry as appendMenuEntryService } from "@/features/menus/entries/api/appendMenuEntry.service";
import { authOrForbidden } from "@/utils/auth";

export async function appendMenuEntry(
	userInputMenu: MenuWithEntriesFormData,
): Promise<MenuWithEntries> {
	const auth = await authOrForbidden();
	return appendMenuEntryService(auth, userInputMenu);
}

export async function appendMenuEntryAction(formData: FormData) {
	const submission = parseWithZod(formData, {
		schema: menuWithEntriesFormSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	let result: MenuWithEntries;

	try {
		result = await appendMenuEntry(submission.value);
	} catch (_error) {
		console.error(_error);

		return submission.reply({
			formErrors: ["Failed to save menu"],
		});
	}

	return result;
}
