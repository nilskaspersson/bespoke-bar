import { useFormMetadata } from "@conform-to/react";
import type { RecipeFormData } from "@/db/schema/composite";
import type { BaseRecipe } from "@/db/schema/recipes";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { withKey } from "@/utils/withKey";

/**
 * TODO: Not fully implemented yet. Lacks an actual schema of form -> recipe.
 */
export function ReviewFormPreview({ formId }: { formId: string }) {
	const { getFieldset } = useFormMetadata<RecipeFormData>(formId);

	const fields = getFieldset();

	const specs = fields.specs.getFieldList().map((spec) =>
		withKey({
			...spec.value,
			ingredient: spec.getFieldset().ingredient.value ?? {},
		}),
	);

	const recipeData =
		typeof fields.recipe?.value !== "string" ? fields.recipe.value : undefined;

	const recipe = {
		...recipeData,
		specs,
	} as BaseRecipe;

	return <RecipeCard recipe={recipe} />;
}
