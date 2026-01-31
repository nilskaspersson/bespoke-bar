import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { createRecipesWithSpecsFromData } from "@/features/recipes/api/upsertRecipesWithSpecs";
import { BulkDraftInfo } from "@/features/recipes/bulk/components/BulkDraftInfo";
import { BulkDraftRecipes } from "@/features/recipes/bulk/components/BulkDraftRecipes";
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
