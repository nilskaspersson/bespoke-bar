import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";

export default function IngredientsPage() {
	return (
		<Container as="article">
			<Heading level="h1">Ingredients</Heading>

			<LinkButton href="/bar/ingredients/create">Create Ingredient</LinkButton>
		</Container>
	);
}
