import { authOrForbidden } from "@bespoke/api/auth";
import { getCachedRecipeSlotUsage } from "@bespoke/api/billing/getRecipeSlotUsage";
import { getCachedIngredients } from "@bespoke/api/ingredients/readIngredients";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { RecipeSlotUsageProvider } from "@/features/billing/components/RecipeSlotUsageProvider";
import { createRecipesWithLinesFromData } from "@/features/recipes/api/upsertRecipesWithLines";
import { BulkDraftRecipesForm } from "@/features/recipes/bulk/components/BulkDraftRecipesForm";
import { CreateRecipeNav } from "@/features/recipes/components/CreateRecipeNav";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";

export default function BulkCreateRecipePage() {
	return (
		<>
			<PageHeader
				overline="Recipes"
				icon="duotone-martini-glass"
				heading="Text Editor"
				tagline="Paste from your notes."
			>
				<CreateRecipeNav active="text" compact />
			</PageHeader>

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
