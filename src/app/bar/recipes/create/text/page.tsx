import { Suspense } from "react";
import { getCachedRecipeSlotUsage } from "@/features/billing/api/getRecipeSlotUsage";
import { RecipeSlotUsageProvider } from "@/features/billing/components/RecipeSlotUsageProvider";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { createRecipesWithSpecsFromData } from "@/features/recipes/api/upsertRecipesWithSpecs";
import { BulkDraftRecipesForm } from "@/features/recipes/bulk/components/BulkDraftRecipesForm";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { authOrForbidden } from "@/utils/auth";

export default function BulkCreateRecipePage() {
	return (
		<Suspense
			fallback={
				<SkeletonScreen>
					<Skeleton width="100%" height="60lvh" />
				</SkeletonScreen>
			}
		>
			<BulkCreateRecipeWithAuth />
		</Suspense>
	);
}

async function BulkCreateRecipeWithAuth() {
	const { orgId } = await authOrForbidden();
	const [ingredients, usage] = await Promise.all([
		getCachedIngredients(orgId),
		getCachedRecipeSlotUsage(orgId),
	]);

	return (
		<RecipeSlotUsageProvider value={usage}>
			<BulkDraftRecipesForm
				ingredients={ingredients}
				createRecipes={createRecipesWithSpecsFromData}
			/>
		</RecipeSlotUsageProvider>
	);
}
