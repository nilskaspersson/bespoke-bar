import type { Metadata } from "next";
import { readOrganisationMembers } from "@/features/organisation/actions/readOrganisationMembers";
import { getCachedBarRecipes } from "@/features/recipes/actions/readBarRecipes";
import { getCachedUserFavoriteRecipeIds } from "@/features/recipes/actions/readUserFavoriteRecipeIds";
import { RecipeTable } from "@/features/recipes/components/RecipeTable";
import { authOrForbidden } from "@/utils/auth";

export default async function FavoriteRecipesPage() {
	const { orgId, userId } = await authOrForbidden();

	const [recipes, members, favoriteRecipeIds] = await Promise.all([
		getCachedBarRecipes(orgId),
		readOrganisationMembers(),
		getCachedUserFavoriteRecipeIds(orgId, userId),
	]);

	const favoriteRecipes = recipes.filter((recipe) =>
		favoriteRecipeIds.includes(recipe.id),
	);

	return (
		<RecipeTable
			recipes={favoriteRecipes}
			members={members}
			favoriteRecipeIds={favoriteRecipeIds}
		/>
	);
}

export const metadata: Metadata = {
	title: "Favorites",
};
