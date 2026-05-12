import type { Metadata } from "next";
import { Suspense } from "react";
import { getCachedRecipeSlotLimit } from "@/features/billing/api/getRecipeSlotLimit";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { getCachedUserFavoriteRecipeIds } from "@/features/recipes/api/readUserFavoriteRecipeIds";
import { CreateRecipeNav } from "@/features/recipes/components/CreateRecipeNav";
import {
	RecipesListBoard,
	RecipesListBoardSkeleton,
} from "@/features/recipes/components/RecipesListBoard";
import { stitchRecipes } from "@/features/recipes/utils/stitchRecipe";
import { getCachedTags } from "@/features/tags/api/listTags";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Text } from "@/ui/Text";
import { authOrForbidden } from "@/utils/auth";
import styles from "./page.module.css";

export default function RecipesPage() {
	return (
		<Suspense fallback={<RecipesListBoardSkeleton />}>
			<RecipesPageWithData />
		</Suspense>
	);
}

async function RecipesPageWithData() {
	const { orgId, userId } = await authOrForbidden();

	const [rawRecipes, ingredients, favoriteRecipeIds, tags, recipeSlotLimit] =
		await Promise.all([
			getCachedBarRecipes(orgId),
			getCachedIngredients(orgId),
			getCachedUserFavoriteRecipeIds(orgId, userId),
			getCachedTags(orgId),
			getCachedRecipeSlotLimit(orgId),
		]);

	const recipes = stitchRecipes(rawRecipes, { ingredients, tags });

	if (recipes.length === 0) {
		return (
			<Container as="section" className={styles.intro}>
				<Grid justifyContent="center" className={styles.content}>
					<Grid as="hgroup" gap={3}>
						<Heading level="h1" size={8} align="center">
							Build your bar
						</Heading>

						<Text as="p" heavy size={3}>
							Three ways to start creating Recipes. Pick what fits the moment!
						</Text>
					</Grid>
				</Grid>

				<CreateRecipeNav />
			</Container>
		);
	}

	return (
		<RecipesListBoard
			recipes={recipes}
			favoriteRecipeIds={favoriteRecipeIds}
			tagOptions={tags}
			recipeSlotLimit={recipeSlotLimit}
		/>
	);
}

export const metadata: Metadata = {
	title: "Recipes",
};
