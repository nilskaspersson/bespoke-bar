"use server";

import { redirect } from "next/navigation";
import type { Ingredient } from "@/db/schema/ingredients";
import { deleteIngredient as deleteIngredientService } from "@/features/ingredients/api/deleteIngredient.service";
import { authOrForbidden } from "@/utils/auth";
import { type ActionResult, catchKnownErrors } from "@/utils/serverAction";

export async function deleteIngredient({
	id,
	redirectTo,
}: {
	id: Ingredient["id"];
	redirectTo?: string;
}): Promise<ActionResult<void>> {
	const auth = await authOrForbidden();

	const result = await catchKnownErrors(async () => {
		await deleteIngredientService(auth, id);
	});

	if (result.ok && redirectTo) {
		redirect(redirectTo);
	}

	return result;
}
