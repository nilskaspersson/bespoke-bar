import type { Metadata } from "next";
import { readIngredients } from "@/features/ingredients/actions/readIngredients";

import { createRecipesFromSpecs } from "@/features/recipes/actions/createRecipeFromSpecs";
import { DraftSpecs } from "@/features/specs/components/DraftSpecs";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";

export default async function CreateRecipePage() {
	const ingredients = await readIngredients();

	return (
		<Container as="article">
			<Grid gap={4}>
				<Heading level="h1">Create Recipe</Heading>

				<DraftSpecs
					createRecipes={createRecipesFromSpecs}
					ingredients={ingredients}
				/>
			</Grid>
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Create Recipe",
};
