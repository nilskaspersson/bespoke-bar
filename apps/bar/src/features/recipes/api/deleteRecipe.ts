"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { deleteRecipe as deleteRecipeService } from "@bespoke/api/recipes/deleteRecipe.service";
import type { Recipe } from "@bespoke/schema/schema/recipes";
import { redirect } from "next/navigation";

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
