import { readIngredients } from "@/features/ingredients/actions/readIngredients";
import { createRecipesWithSpecsFromData } from "@/features/recipes/actions/upsertRecipeWithSpecs";
import { BulkDraftInfo } from "@/features/recipes/components/BulkDraftInfo";
import { BulkDraftRecipes } from "@/features/recipes/components/BulkDraftRecipes";

export default async function BulkCreateRecipePage() {
	const ingredients = await readIngredients();

	return (
		<BulkDraftRecipes
			ingredients={ingredients}
			empty={<BulkDraftInfo />}
			createRecipes={createRecipesWithSpecsFromData}
		/>
	);
}
