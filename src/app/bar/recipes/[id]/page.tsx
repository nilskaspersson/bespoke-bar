import { notFound } from "next/navigation";
import { readRecipe } from "@/features/recipes/actions/readRecipe";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";

type Props = {
	params: Promise<{ id?: string }>;
};

export default async function RecipePage({ params: paramsPromise }: Props) {
	const { id } = await paramsPromise;
	const recipe = await readRecipe(id);

	if (!recipe) {
		notFound();
	}

	return (
		<Container as="article">
			<Heading level="h1">
				<RecipeName recipe={recipe} />
			</Heading>

			<LinkButton href={`/bar/recipes/${id}/edit`}>
				Edit
				<Icon name="pen" />
			</LinkButton>

			<ul>
				{recipe.specs.map((spec) => (
					<li key={spec.id}>
						{spec.quantity} {spec.unit} {spec.ingredient}
					</li>
				))}
			</ul>
		</Container>
	);
}
