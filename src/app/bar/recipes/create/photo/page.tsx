import type { Metadata } from "next";
import { Suspense } from "react";
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
	const ingredients = await getCachedIngredients(orgId);

	return <PhotoToRecipe ingredients={ingredients} />;
}

export const metadata: Metadata = {
	title: "Photo to Recipe",
};
