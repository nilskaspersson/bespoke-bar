import { authOrForbidden } from "@bespoke/api/auth";
import { getCachedRecipeSlotUsage } from "@bespoke/api/billing/getRecipeSlotUsage";
import { getCachedIngredients } from "@bespoke/api/ingredients/readIngredients";
import { Skeleton, SkeletonScreen } from "@bespoke/ui/Skeleton";
import { Suspense } from "react";
import { RecipeSlotUsageProvider } from "@/features/billing/components/RecipeSlotUsageProvider";
import { createRecipesWithLinesFromData } from "@/features/recipes/api/upsertRecipesWithLines";
import { BulkDraftRecipesForm } from "@/features/recipes/bulk/components/BulkDraftRecipesForm";
import { CreateRecipeHeader } from "@/features/recipes/components/CreateRecipeHeader";

export default function BulkCreateRecipePage() {
	return (
		<>
			<CreateRecipeHeader
				active="text"
				heading="Text Editor"
				tagline="Paste from your notes."
			/>

			<Suspense
				fallback={
					<SkeletonScreen>
						<Skeleton width="100%" height="60lvh" />
					</SkeletonScreen>
				}
			>
				<BulkCreateRecipeWithAuth />
			</Suspense>
		</>
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
				createRecipes={createRecipesWithLinesFromData}
			/>
		</RecipeSlotUsageProvider>
	);
}
