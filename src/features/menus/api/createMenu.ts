"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { redirect } from "next/navigation";
import type { Menu, MenuFormData } from "@/db/schema/menus";
import { menuFormSchema } from "@/db/schema/menus";
import { createMenu as createMenuService } from "@/features/menus/api/createMenu.service";
import { getMenuUrl } from "@/features/menus/utils";
import { authOrForbidden } from "@/utils/auth";

export async function createMenu(userInputMenu: MenuFormData): Promise<Menu> {
	const auth = await authOrForbidden();
	return createMenuService(auth, userInputMenu);
}

export async function createMenuAction(
	_prevState: unknown,
	formData: FormData,
) {
	const submission = parseWithZod(formData, {
		schema: menuFormSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	let result: Menu;

	try {
		result = await createMenu(submission.value);
	} catch (_error) {
		return submission.reply({
			formErrors: ["Failed to create menu"],
		});
	}

	redirect(getMenuUrl(result));
}
