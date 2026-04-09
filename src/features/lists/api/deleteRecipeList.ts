"use server";

import { redirect } from "next/navigation";
import type { RecipeList } from "@/db/schema/recipeLists";
import { deleteRecipeList as deleteRecipeListService } from "@/features/lists/api/deleteRecipeList.service";
import { authOrForbidden } from "@/utils/auth";

export async function deleteRecipeList({
	id,
	redirectTo,
}: {
	id: RecipeList["id"];
	redirectTo?: string;
}): Promise<void> {
	const auth = await authOrForbidden();
	await deleteRecipeListService(auth, id);

	if (redirectTo) {
		redirect(redirectTo);
	}
}
