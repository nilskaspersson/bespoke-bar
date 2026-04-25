import type { Metadata } from "next";
import { Suspense } from "react";
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
	const ingredients = await getCachedIngredients(orgId);

	return <RecipeForm ingredients={ingredients} />;
}

export const metadata: Metadata = {
	title: "Create Recipe",
};
