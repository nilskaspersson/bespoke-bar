import type { Metadata } from "next";
import Link from "next/link";
import { readIngredients } from "@/features/ingredients/actions/readIngredients";
import { getIngredientUrl } from "@/features/ingredients/utils";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";

export default async function IngredientsPage() {
	const ingredients = await readIngredients();

	return (
		<Container as="article">
			<Heading level="h1">Ingredients</Heading>

			<LinkButton href="/bar/ingredients/create" variant="solid" color="heavy">
				Create Ingredient
			</LinkButton>

			<ul>
				{ingredients.map((ingredient) => (
					<li key={ingredient.id}>
						<Link href={getIngredientUrl(ingredient)}>{ingredient.name}</Link>
					</li>
				))}
			</ul>
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Ingredients",
};
