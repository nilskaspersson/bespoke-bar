import type { Metadata } from "next";
import { Suspense } from "react";
import { readOrganisationMembers } from "@/features/organisation/api/readOrganisationMembers";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { getCachedUserFavoriteRecipeIds } from "@/features/recipes/api/readUserFavoriteRecipeIds";
import { RecipeDataTableSkeleton } from "@/features/recipes/components/RecipeDataTable";
import { RecipeDataTableLoader } from "@/features/recipes/components/RecipeDataTable/Loader";
import { RecipesList } from "@/features/recipes/components/RecipesList";
import { RecipeViews } from "@/features/recipes/components/RecipeViews";
import { authOrForbidden } from "@/utils/auth";

export default async function FavoriteRecipesPage() {
	const { orgId, userId } = await authOrForbidden();

	const [recipes, favoriteRecipeIds, members] = await Promise.all([
		getCachedBarRecipes(orgId),
		getCachedUserFavoriteRecipeIds(orgId, userId),
		readOrganisationMembers(),
	]);

	const favoriteRecipes = recipes.filter((recipe) =>
		favoriteRecipeIds.includes(recipe.id),
	);

	return (
		<RecipeViews
			list={
				<RecipesList
					recipes={favoriteRecipes}
					favoriteRecipeIds={favoriteRecipeIds}
					withActions
				/>
			}
			table={
				<Suspense fallback={<RecipeDataTableSkeleton />}>
					<RecipeDataTableLoader recipes={favoriteRecipes} members={members} />
				</Suspense>
			}
		/>
	);
}

export const metadata: Metadata = {
	title: "Favorites",
};
