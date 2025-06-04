import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";

export default function RecipesPage() {
	return (
		<Container as="article">
			<Heading level="h1">Recipes</Heading>

			<LinkButton href="/bar/recipes/create">
				Create Recipe
				<Icon name="pen" />
			</LinkButton>
		</Container>
	);
}
