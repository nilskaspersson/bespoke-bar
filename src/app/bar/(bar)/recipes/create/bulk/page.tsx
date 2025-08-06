import { getCachedIngredients } from "@/features/ingredients/actions/readIngredients";
import { createRecipesWithSpecsFromData } from "@/features/recipes/actions/upsertRecipeWithSpecs";
import { BulkDraftInfo } from "@/features/recipes/components/BulkDraftInfo";
import { BulkDraftRecipes } from "@/features/recipes/components/BulkDraftRecipes";
import { authOrForbidden } from "@/utils/auth";

export default async function BulkCreateRecipePage() {
	const { orgId } = await authOrForbidden();
	const ingredients = await getCachedIngredients(orgId);

	return (
		<BulkDraftRecipes
			ingredients={ingredients}
			empty={<BulkDraftInfo />}
			createRecipes={createRecipesWithSpecsFromData}
		/>
	);
}
