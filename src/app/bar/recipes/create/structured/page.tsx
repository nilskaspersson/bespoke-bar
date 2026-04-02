import type { Metadata } from "next";
import { Suspense } from "react";
import { OrgProvider } from "@/components/OrgProvider";
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

	return (
		<OrgProvider>
			<RecipeForm ingredients={ingredients} />
		</OrgProvider>
	);
}

export const metadata: Metadata = {
	title: "Create Recipe",
};
