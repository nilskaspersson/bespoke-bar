import Link from "next/link";
import { getBarRecipes } from "@/features/recipes/actions/getBarRecipes";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";

export default async function RecipesPage() {
	const recipes = await getBarRecipes();

	return (
		<Container as="article">
			<header>
				<Heading level="h1">Recipes</Heading>

				<LinkButton href="/bar/recipes/create">
					Create Recipe
					<Icon name="pen" />
				</LinkButton>
			</header>

			<ul>
				{recipes.map((recipe) => (
					<li key={recipe.id}>
						<Link href={`/bar/recipes/${recipe.id}`}>
							{recipe.name ?? "Unnamed Recipe"}
						</Link>
					</li>
				))}
			</ul>
		</Container>
	);
}
