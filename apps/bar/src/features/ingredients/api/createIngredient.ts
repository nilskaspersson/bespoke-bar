"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { createIngredient as createIngredientService } from "@bespoke/api/ingredients/createIngredient.service";
import type {
	DraftIngredient,
	Ingredient,
} from "@bespoke/schema/schema/ingredients";

export async function createIngredient(
	userIngredient: DraftIngredient,
): Promise<Ingredient> {
	const auth = await authOrForbidden();
	return createIngredientService(auth, userIngredient);
}
