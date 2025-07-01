import { readIngredients } from "@/features/ingredients/actions/readIngredients";
import { createRecipesFromSpecs } from "@/features/recipes/actions/createRecipeFromSpecs";
import { BulkDraftInfo } from "@/features/recipes/components/BulkDraftInfo";
import { BulkDraftRecipes } from "@/features/recipes/components/BulkDraftRecipes";

export default async function BulkCreateRecipePage() {
	const ingredients = await readIngredients();

	return (
		<BulkDraftRecipes
			createRecipes={createRecipesFromSpecs}
			ingredients={ingredients}
			empty={<BulkDraftInfo />}
		/>
	);
}
