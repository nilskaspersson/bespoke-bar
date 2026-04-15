import { Suspense } from "react";
import { OrgProvider } from "@/components/OrgProvider";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { createRecipesWithSpecsFromData } from "@/features/recipes/api/upsertRecipesWithSpecs";
import { BulkDraftInfo } from "@/features/recipes/bulk/components/BulkDraftInfo";
import { BulkDraftRecipes } from "@/features/recipes/bulk/components/BulkDraftRecipes";
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
			<BulkDraftRecipes
				ingredients={ingredients}
				info={<BulkDraftInfo />}
				createRecipes={createRecipesWithSpecsFromData}
			/>
		</OrgProvider>
	);
}
