"use server";

import { redirect } from "next/navigation";
import type { Ingredient } from "@/db/schema/ingredients";
import { deleteIngredient as deleteIngredientService } from "@/features/ingredients/api/deleteIngredient.service";
import { authOrForbidden } from "@/utils/auth";

export async function deleteIngredient({
	id,
	redirectTo,
}: {
	id: Ingredient["id"];
	redirectTo?: string;
}): Promise<void> {
	const auth = await authOrForbidden();
	await deleteIngredientService(auth, id);

	if (redirectTo) {
		redirect(redirectTo);
	}
}
