import type { Metadata } from "next";
import { Suspense } from "react";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { readOrganisationMembers } from "@/features/organisation/api/readOrganisationMembers";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { getCachedUserFavoriteRecipeIds } from "@/features/recipes/api/readUserFavoriteRecipeIds";
import { RecipeDataTableSkeleton } from "@/features/recipes/components/RecipeDataTable";
import { RecipeDataTableLoader } from "@/features/recipes/components/RecipeDataTable/Loader";
import {
	RecipesList,
	RecipesListSkeleton,
} from "@/features/recipes/components/RecipesList";
import { RecipeViews } from "@/features/recipes/components/RecipeViews";
import {
	buildIngredientMap,
	stitchRecipeSpecs,
} from "@/features/specs/utils/stitchIngredients";
import { authOrForbidden } from "@/utils/auth";

export default function FavoriteRecipesPage() {
	return (
		<Suspense fallback={<RecipesListSkeleton />}>
			<FavoriteRecipesWithAuth />
		</Suspense>
	);
}

async function FavoriteRecipesWithAuth() {
	const { orgId, userId } = await authOrForbidden();

	const [rawRecipes, ingredients, favoriteRecipeIds, members] =
		await Promise.all([
			getCachedBarRecipes(orgId),
			getCachedIngredients(orgId),
			getCachedUserFavoriteRecipeIds(orgId, userId),
			readOrganisationMembers(),
		]);

	const ingredientMap = buildIngredientMap(ingredients);
	const favoriteRecipes = rawRecipes
		.filter((recipe) => favoriteRecipeIds.includes(recipe.id))
		.map((r) => stitchRecipeSpecs(r, ingredientMap));

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
