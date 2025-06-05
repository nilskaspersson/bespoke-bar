import { notFound } from "next/navigation";
import { getRecipe } from "@/features/recipes/actions/getRecipe";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";

type Args = {
	params: Promise<{ id?: string }>;
};

export default async function RecipePage({ params: paramsPromise }: Args) {
	const { id } = await paramsPromise;
	const recipe = await getRecipe(id);

	if (!recipe) {
		notFound();
	}

	return (
		<Container>
			<Heading level="h1">{recipe.name ?? "Unnamed Recipe"}</Heading>

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
