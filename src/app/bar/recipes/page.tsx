import type { Metadata } from "next";
import Link from "next/link";
import { readBarRecipes } from "@/features/recipes/actions/readBarRecipes";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { recipeToUrlSlug } from "@/utils/url";

export default async function RecipesPage() {
	const recipes = await readBarRecipes();
	const archivedRecipes = await readBarRecipes({ archivedRecipes: true });

	return (
		<Container as="article">
			<header>
				<Heading level="h1">Recipes</Heading>

				<LinkButton href="/bar/recipes/create" variant="solid" color="heavy">
					Create Recipe
					<Icon name="pen" />
				</LinkButton>
			</header>

			<ul>
				{recipes.map((recipe) => (
					<li key={recipe.id}>
						<Link href={`/bar/recipes/${recipe.id}/${recipeToUrlSlug(recipe)}`}>
							<RecipeName recipe={recipe} />
						</Link>
					</li>
				))}
			</ul>

			<Heading level="h6">Archive</Heading>
			<ul>
				{archivedRecipes.map((recipe) => (
					<li key={recipe.id}>
						<Link href={`/bar/recipes/${recipe.id}/${recipeToUrlSlug(recipe)}`}>
							<RecipeName recipe={recipe} />
						</Link>
					</li>
				))}
			</ul>
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Recipes",
};
