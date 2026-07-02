"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { updateMenu as updateMenuService } from "@bespoke/api/menus/updateMenu.service";
import { isUniqueConstraintViolation } from "@bespoke/db/utils";
import { type Menu, menuFormSchema } from "@bespoke/schema/schema/menus";
import { parseWithZod } from "@conform-to/zod/v4";

export async function updateMenuAction(id: Menu["id"], formData: FormData) {
	const submission = parseWithZod(formData, { schema: menuFormSchema });

	if (submission.status !== "success" || !id) {
		return submission.reply();
	}

	try {
		const auth = await authOrForbidden();
		await updateMenuService(auth, id, {
			name: submission.value.name ?? "",
			description: submission.value.description ?? null,
		});
	} catch (error) {
		if (
			isUniqueConstraintViolation(error, "unique_menu_name_case_insensitive")
		) {
			return submission.reply({
				fieldErrors: { name: ["A menu with this name already exists."] },
			});
		}

		console.error(error);

		return submission.reply({ formErrors: ["Failed to update menu."] });
	}

	return submission.reply();
}
