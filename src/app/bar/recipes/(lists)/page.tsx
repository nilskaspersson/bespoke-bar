import type { Metadata } from "next";
import { Suspense } from "react";
import { readOrganisationMembers } from "@/features/organisation/api/readOrganisationMembers";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { getCachedUserFavoriteRecipeIds } from "@/features/recipes/api/readUserFavoriteRecipeIds";
import {
	RecipeTable,
	RecipeTableSkeleton,
} from "@/features/recipes/components/RecipeTable";
import { authOrForbidden } from "@/utils/auth";

export default async function RecipesPage() {
	return (
		<Suspense fallback={<RecipeTableSkeleton />}>
			<RecipeTableWithData />
		</Suspense>
	);
}

async function RecipeTableWithData() {
	const { orgId, userId } = await authOrForbidden();

	const [recipes, members, favoriteRecipeIds] = await Promise.all([
		getCachedBarRecipes(orgId),
		readOrganisationMembers(),
		getCachedUserFavoriteRecipeIds(orgId, userId),
	]);

	return (
		<RecipeTable
			recipes={recipes}
			members={members}
			favoriteRecipeIds={favoriteRecipeIds}
		/>
	);
}

export const metadata: Metadata = {
	title: "Recipes",
};
