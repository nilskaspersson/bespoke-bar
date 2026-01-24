import type { Metadata } from "next";
import { Suspense } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
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

	const [recipes, favoriteRecipeIds] = await Promise.all([
		getCachedBarRecipes(orgId),
		getCachedUserFavoriteRecipeIds(orgId, userId),
	]);

	const favoriteRecipes = recipes.filter((recipe) =>
		favoriteRecipeIds.includes(recipe.id),
	);

	return (
		<RecipeViews
			list={
				<RecipesList
					recipes={favoriteRecipes}
					view="list"
					favoriteRecipeIds={favoriteRecipeIds}
				/>
			}
			card={
				<RecipesList
					recipes={favoriteRecipes}
					view="card"
					favoriteRecipeIds={favoriteRecipeIds}
				/>
			}
			table={
				<Suspense fallback={<RecipeDataTableSkeleton />}>
					<RecipeDataTableWithMembers recipes={favoriteRecipes} />
				</Suspense>
			}
		/>
	);
}

async function RecipeDataTableWithMembers({
	recipes,
}: {
	recipes: RecipeWithSpecs[];
}) {
	const members = await readOrganisationMembers();

	return <RecipeDataTableLoader recipes={recipes} members={members} />;
}

export const metadata: Metadata = {
	title: "Favorites",
};
