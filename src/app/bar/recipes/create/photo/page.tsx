import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { getCachedRecipeSlotUsage } from "@/features/billing/api/getRecipeSlotUsage";
import { RecipeSlotUsageProvider } from "@/features/billing/components/RecipeSlotUsageProvider";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { CreateRecipeNav } from "@/features/recipes/components/CreateRecipeNav";
import { PhotoToRecipe } from "@/features/recipes/photo/components/PhotoToRecipe";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { authOrForbidden } from "@/utils/auth";

export default function PhotoToRecipePage() {
	return (
		<>
			<PageHeader
				overline="Recipes"
				icon="duotone-martini-glass"
				heading="Photo"
				tagline="Snap a napkin."
			>
				<CreateRecipeNav active="photo" compact />
			</PageHeader>

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
