"use server";

import type { Recipe } from "@bespoke/schema/schema/recipes";
import { redirect } from "next/navigation";
import { deleteRecipe as deleteRecipeService } from "@/features/recipes/api/deleteRecipe.service";
import { authOrForbidden } from "@/utils/auth";

export async function deleteRecipe({
	id,
	redirectTo,
}: {
	id: Recipe["id"];
	redirectTo?: string;
}): Promise<void> {
	const auth = await authOrForbidden();
	await deleteRecipeService(auth, id);

	if (redirectTo) {
		redirect(redirectTo);
	}
}
