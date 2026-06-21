"use server";

import type {
	DraftIngredient,
	Ingredient,
} from "@bespoke/schema/schema/ingredients";
import { updateIngredientFormSchema } from "@bespoke/schema/schema/ingredients";
import { parseWithZod } from "@conform-to/zod/v4";
import { isUniqueConstraintViolation } from "@/db/utils";
import { updateIngredient as updateIngredientService } from "@/features/ingredients/api/updateIngredient.service";
import { authOrForbidden } from "@/utils/auth";

/** @public */
export async function updateIngredient(
	id: string,
	userInputIngredient: Partial<DraftIngredient>,
): Promise<Ingredient> {
	const auth = await authOrForbidden();
	return updateIngredientService(auth, id, userInputIngredient);
}

export async function updateIngredientAction(
	id: Ingredient["id"],
	formData: FormData,
) {
	const submission = parseWithZod(formData, {
		schema: updateIngredientFormSchema,
	});

	if (submission.status !== "success" || !id) {
		return submission.reply();
	}

	try {
		await updateIngredient(id, submission.value);
	} catch (error) {
		if (
			isUniqueConstraintViolation(
				error,
				"unique_ingredient_name_case_insensitive",
			)
		) {
			return submission.reply({
				fieldErrors: {
					name: ["An ingredient with this name already exists."],
				},
			});
		}

		return submission.reply({
			formErrors: ["Failed to update ingredient."],
		});
	}

	return submission.reply();
}
