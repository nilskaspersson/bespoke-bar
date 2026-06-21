import { authOrForbidden } from "@bespoke/api/auth";
import { getCachedRecipeSlotLimit } from "@bespoke/api/billing/getRecipeSlotLimit";
import { getCachedIngredients } from "@bespoke/api/ingredients/readIngredients";
import { getCachedBarRecipes } from "@bespoke/api/recipes/readBarRecipes";
import { getCachedUserFavoriteRecipeIds } from "@bespoke/api/recipes/readUserFavoriteRecipeIds";
import { getCachedTags } from "@bespoke/api/tags/listTags";
import { stitchRecipes } from "@bespoke/domain/recipes/stitchRecipe";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CreateRecipeNav } from "@/features/recipes/components/CreateRecipeNav";
import {
	RecipesListBoard,
	RecipesListBoardSkeleton,
} from "@/features/recipes/components/RecipesListBoard";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Text } from "@/ui/Text";
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
				<Grid
					justifyContent="center"
					alignContent="center"
					className={styles.content}
				>
					<Grid as="hgroup" gap={3}>
						<Heading level="h1" size={8} align="center">
							Build your bar
						</Heading>

						<Text as="p" heavy size={3}>
							Three ways to start creating Recipes. Pick what fits the moment!
						</Text>
					</Grid>
				</Grid>

				<CreateRecipeNav onBoarding />
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
