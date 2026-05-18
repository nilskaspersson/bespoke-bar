"use server";

import { redirect } from "next/navigation";
import type { Menu } from "@/db/schema/menus";
import { deleteMenu as deleteMenuService } from "@/features/menus/api/deleteMenu.service";
import { authOrForbidden } from "@/utils/auth";

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
