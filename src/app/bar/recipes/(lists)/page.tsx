import type { Metadata } from "next";
import { Suspense } from "react";
import { readOrganisationMembers } from "@/features/organisation/api/readOrganisationMembers";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { getCachedUserFavoriteRecipeIds } from "@/features/recipes/api/readUserFavoriteRecipeIds";
import { RecipeDataTableSkeleton } from "@/features/recipes/components/RecipeDataTable";
import { RecipeDataTableLoader } from "@/features/recipes/components/RecipeDataTable/Loader";
import { RecipesList } from "@/features/recipes/components/RecipesList";
import { RecipeTableSkeleton } from "@/features/recipes/components/RecipeTable";
import { RecipeViews } from "@/features/recipes/components/RecipeViews";
import { authOrForbidden } from "@/utils/auth";

export default async function RecipesPage() {
	return (
		<Suspense fallback={<RecipeTableSkeleton />}>
			<RecipeViewsWithData />
		</Suspense>
	);
}

async function RecipeViewsWithData() {
	const { orgId, userId } = await authOrForbidden();

	const [recipes, favoriteRecipeIds] = await Promise.all([
		getCachedBarRecipes(orgId),
		getCachedUserFavoriteRecipeIds(orgId, userId),
	]);

	return (
		<RecipeViews
			list={
				<RecipesList
					recipes={recipes}
					view="list"
					favoriteRecipeIds={favoriteRecipeIds}
				/>
			}
			card={
				<RecipesList
					recipes={recipes}
					view="card"
					favoriteRecipeIds={favoriteRecipeIds}
				/>
			}
			table={
				<Suspense fallback={<RecipeDataTableSkeleton />}>
					<RecipeDataTableWithMembers recipes={recipes} />
				</Suspense>
			}
		/>
	);
}

async function RecipeDataTableWithMembers({
	recipes,
}: {
	recipes: Awaited<ReturnType<typeof getCachedBarRecipes>>;
}) {
	const members = await readOrganisationMembers();

	return <RecipeDataTableLoader recipes={recipes} members={members} />;
}

export const metadata: Metadata = {
	title: "Recipes",
};
