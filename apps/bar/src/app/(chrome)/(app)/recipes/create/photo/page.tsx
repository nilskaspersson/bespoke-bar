import { authOrForbidden } from "@bespoke/api/auth";
import { getCachedRecipeSlotUsage } from "@bespoke/api/billing/getRecipeSlotUsage";
import { getCachedIngredients } from "@bespoke/api/ingredients/readIngredients";
import { Skeleton, SkeletonScreen } from "@bespoke/ui/Skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { RecipeSlotUsageProvider } from "@/features/billing/components/RecipeSlotUsageProvider";
import { CreateRecipeHeader } from "@/features/recipes/components/CreateRecipeHeader";
import { PhotoToRecipe } from "@/features/recipes/photo/components/PhotoToRecipe";

export default function PhotoToRecipePage() {
	return (
		<>
			<CreateRecipeHeader
				active="photo"
				heading="Photo"
				tagline="Snap a napkin."
			/>

			<Suspense
				fallback={
					<SkeletonScreen>
						<Skeleton width="100%" height="60lvh" />
					</SkeletonScreen>
				}
			>
				<PhotoToRecipeWithAuth />
			</Suspense>
		</>
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
