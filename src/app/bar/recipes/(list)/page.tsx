import type { Metadata } from "next";
import { Suspense } from "react";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { readOrganisationMembers } from "@/features/organisation/api/readOrganisationMembers";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { getCachedUserFavoriteRecipeIds } from "@/features/recipes/api/readUserFavoriteRecipeIds";
import { RecipeDataTableSkeleton } from "@/features/recipes/components/RecipeDataTable";
import { RecipeDataTableLoader } from "@/features/recipes/components/RecipeDataTable/Loader";
import { RecipesListSkeleton } from "@/features/recipes/components/RecipesList";
import { RecipesListFilters } from "@/features/recipes/components/RecipesListFilters";
import { RecipeViews } from "@/features/recipes/components/RecipeViews";
import {
	buildIngredientMap,
	stitchRecipeSpecs,
} from "@/features/specs/utils/stitchIngredients";
import { getCachedTags } from "@/features/tags/api/listTags";
import { authOrForbidden } from "@/utils/auth";

export default async function RecipesPage() {
	return (
		<Suspense fallback={<RecipesListSkeleton />}>
			<RecipeViewsWithData />
		</Suspense>
	);
}

async function RecipeViewsWithData() {
	const { orgId, userId } = await authOrForbidden();

	const [rawRecipes, ingredients, favoriteRecipeIds, members, tagOptions] =
		await Promise.all([
			getCachedBarRecipes(orgId),
			getCachedIngredients(orgId),
			getCachedUserFavoriteRecipeIds(orgId, userId),
			readOrganisationMembers(),
			getCachedTags(orgId),
		]);

	const ingredientMap = buildIngredientMap(ingredients);
	const recipes = rawRecipes.map((r) => stitchRecipeSpecs(r, ingredientMap));

	return (
		<RecipeViews
			list={
				<RecipesListFilters
					recipes={recipes}
					favoriteRecipeIds={favoriteRecipeIds}
					tagOptions={tagOptions}
				/>
			}
			table={
				<Suspense fallback={<RecipeDataTableSkeleton />}>
					<RecipeDataTableLoader recipes={recipes} members={members} />
				</Suspense>
			}
		/>
	);
}

export const metadata: Metadata = {
	title: "Recipes",
};
