"use server";

import { redirect } from "next/navigation";
import type { Recipe } from "@/db/schema/recipes";
import {
	archiveRecipe as archiveRecipeService,
	unarchiveRecipe as unarchiveRecipeService,
} from "@/features/recipes/api/archiveRecipe.service";
import { authOrForbidden } from "@/utils/auth";

export async function archiveRecipe({
	id,
	redirectTo,
}: {
	id: Recipe["id"];
	redirectTo?: string;
}): Promise<void> {
	const auth = await authOrForbidden();
	await archiveRecipeService(auth, id);

	if (redirectTo) {
		redirect(redirectTo);
	}
}

export async function unarchiveRecipe({
	id,
	redirectTo,
}: {
	id: Recipe["id"];
	redirectTo?: string;
}): Promise<void> {
	const auth = await authOrForbidden();
	await unarchiveRecipeService(auth, id);

	if (redirectTo) {
		redirect(redirectTo);
	}
}
