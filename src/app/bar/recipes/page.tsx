import Link from "next/link";
import { readBarRecipes } from "@/features/recipes/actions/readBarRecipes";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";

export default async function RecipesPage() {
	const recipes = await readBarRecipes();

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
							<RecipeName recipe={recipe} />
						</Link>
					</li>
				))}
			</ul>
		</Container>
	);
}
