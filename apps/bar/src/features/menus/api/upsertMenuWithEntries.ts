"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { redirect } from "next/navigation";
import {
	type MenuWithEntriesFormData,
	menuWithEntriesFormSchema,
} from "@/db/schema/composite";
import type { Menu } from "@/db/schema/menus";
import { upsertMenuWithEntries as upsertMenuWithEntriesService } from "@/features/menus/api/upsertMenuWithEntries.service";
import { getMenuUrl } from "@/features/menus/utils";
import { authOrForbidden } from "@/utils/auth";

/** @public */
export async function upsertMenuWithEntries(
	userInputMenu: MenuWithEntriesFormData,
): Promise<Menu> {
	const auth = await authOrForbidden();
	return upsertMenuWithEntriesService(auth, userInputMenu);
}

export async function upsertMenuWithEntriesAction(formData: FormData) {
	const submission = parseWithZod(formData, {
		schema: menuWithEntriesFormSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	let result: Menu;

	try {
		result = await upsertMenuWithEntries(submission.value);
	} catch (_error) {
		console.error(_error);

		return submission.reply({
			formErrors: ["Failed to save menu"],
		});
	}

	redirect(getMenuUrl(result));
}
