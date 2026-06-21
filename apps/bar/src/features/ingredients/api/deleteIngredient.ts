"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { deleteIngredient as deleteIngredientService } from "@bespoke/api/ingredients/deleteIngredient.service";
import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { redirect } from "next/navigation";
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
