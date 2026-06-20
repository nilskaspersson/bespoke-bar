"use server";

import type { DraftIngredient, Ingredient } from "@/db/schema/ingredients";
import { createIngredient as createIngredientService } from "@/features/ingredients/api/createIngredient.service";
import { authOrForbidden } from "@/utils/auth";

export async function createIngredient(
	userIngredient: DraftIngredient,
): Promise<Ingredient> {
	const auth = await authOrForbidden();
	return createIngredientService(auth, userIngredient);
}
