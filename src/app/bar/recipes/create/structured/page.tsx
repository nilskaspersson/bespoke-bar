import type { Metadata } from "next";
import { Suspense } from "react";
import { getCachedRecipeSlotUsage } from "@/features/billing/api/getRecipeSlotUsage";
import { RecipeSlotUsageProvider } from "@/features/billing/components/RecipeSlotUsageProvider";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { RecipeForm } from "@/features/recipes/components/RecipeForm";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { authOrForbidden } from "@/utils/auth";

export default function CreateRecipePage() {
	return (
		<Suspense
			fallback={
				<SkeletonScreen>
					<Skeleton width="100%" height="60lvh" />
				</SkeletonScreen>
			}
		>
			<CreateRecipeWithAuth />
		</Suspense>
	);
}

async function CreateRecipeWithAuth() {
	const { orgId } = await authOrForbidden();
	const [ingredients, usage] = await Promise.all([
		getCachedIngredients(orgId),
		getCachedRecipeSlotUsage(orgId),
	]);

	return (
		<RecipeSlotUsageProvider value={usage}>
			<RecipeForm ingredients={ingredients} />
		</RecipeSlotUsageProvider>
	);
}

export const metadata: Metadata = {
	title: "Create Recipe",
};
