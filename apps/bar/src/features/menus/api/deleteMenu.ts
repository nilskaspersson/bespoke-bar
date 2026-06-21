"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { deleteMenu as deleteMenuService } from "@bespoke/api/menus/deleteMenu.service";
import type { Menu } from "@bespoke/schema/schema/menus";
import { redirect } from "next/navigation";

export async function deleteMenu({
	id,
	redirectTo,
}: {
	id: Menu["id"];
	redirectTo?: string;
}): Promise<void> {
	const auth = await authOrForbidden();
	await deleteMenuService(auth, id);

	if (redirectTo) {
		redirect(redirectTo);
	}
}
