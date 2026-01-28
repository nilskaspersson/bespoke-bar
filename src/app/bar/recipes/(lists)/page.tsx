import type { Metadata } from "next";
import { Suspense } from "react";
import { readOrganisationMembers } from "@/features/organisation/api/readOrganisationMembers";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { getCachedUserFavoriteRecipeIds } from "@/features/recipes/api/readUserFavoriteRecipeIds";
import { RecipeDataTableSkeleton } from "@/features/recipes/components/RecipeDataTable";
import { RecipeDataTableLoader } from "@/features/recipes/components/RecipeDataTable/Loader";
import { RecipesList } from "@/features/recipes/components/RecipesList";
import { RecipeViews } from "@/features/recipes/components/RecipeViews";
import { Grid } from "@/ui/Grid";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { authOrForbidden } from "@/utils/auth";

export default async function RecipesPage() {
	return (
		<Suspense
			fallback={
				<SkeletonScreen>
					<Grid gap={4}>
						<Skeleton width="100%" height="147px" />
						<Skeleton width="100%" height="147px" />
						<Skeleton width="100%" height="147px" />
					</Grid>
				</SkeletonScreen>
			}
		>
			<RecipeViewsWithData />
		</Suspense>
	);
}

async function RecipeViewsWithData() {
	const { orgId, userId } = await authOrForbidden();

	const [recipes, favoriteRecipeIds, members] = await Promise.all([
		getCachedBarRecipes(orgId),
		getCachedUserFavoriteRecipeIds(orgId, userId),
		readOrganisationMembers(),
	]);

	return (
		<RecipeViews
			list={
				<RecipesList
					recipes={recipes}
					favoriteRecipeIds={favoriteRecipeIds}
					withActions
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
