import { Suspense } from "react";
import { OrgProvider } from "@/components/OrgProvider";
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
	const ingredients = await getCachedIngredients(orgId);

	return (
		<OrgProvider>
			<BulkDraftRecipesForm
				ingredients={ingredients}
				createRecipes={createRecipesWithSpecsFromData}
			/>
		</OrgProvider>
	);
}
