import type { Metadata } from "next";
import { Suspense } from "react";
import { getCachedRecipeSlotUsage } from "@/features/billing/api/getRecipeSlotUsage";
import { RecipeSlotUsageProvider } from "@/features/billing/components/RecipeSlotUsageProvider";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { PhotoToRecipe } from "@/features/recipes/photo/components/PhotoToRecipe";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { authOrForbidden } from "@/utils/auth";

export default function PhotoToRecipePage() {
	return (
		<Suspense
			fallback={
				<SkeletonScreen>
					<Skeleton width="100%" height="60lvh" />
				</SkeletonScreen>
			}
		>
			<PhotoToRecipeWithAuth />
		</Suspense>
	);
}

async function PhotoToRecipeWithAuth() {
	const { orgId } = await authOrForbidden();
	const [ingredients, usage] = await Promise.all([
		getCachedIngredients(orgId),
		getCachedRecipeSlotUsage(orgId),
	]);

	return (
		<RecipeSlotUsageProvider value={usage}>
			<PhotoToRecipe ingredients={ingredients} />
		</RecipeSlotUsageProvider>
	);
}

export const metadata: Metadata = {
	title: "Photo to Recipe",
};
