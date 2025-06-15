import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteIngredient } from "@/features/ingredients/actions/deleteIngredient";
import { readIngredient } from "@/features/ingredients/actions/readIngredient";
import { DeleteIngredient } from "@/features/ingredients/components/DeleteIngredient";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";

type Props = {
	params: Promise<{ id?: string }>;
};

export default async function IngredientPage({ params }: Props) {
	const { id } = await params;
	const ingredient = await readIngredient(id);

	if (!ingredient) {
		return notFound();
	}

	return (
		<Container as="article">
			<Heading level="h1">{ingredient.name}</Heading>

			<DeleteIngredient
				ingredient={ingredient}
				action={deleteIngredient.bind(null, {
					id: ingredient.id,
					redirectTo: "/bar/ingredients",
				})}
			>
				<Icon name="trash" /> Delete
			</DeleteIngredient>

			<LinkButton href={`/bar/ingredients/${id}/edit`}>Edit</LinkButton>

			<Text as="p">{ingredient.category}</Text>
			<Text as="p">{ingredient.abv}</Text>
			<Text as="p">{ingredient.brand}</Text>
			<Text as="p">{ingredient.price}</Text>
			<Text as="p">{ingredient.measurementType}</Text>
		</Container>
	);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	const ingredient = await readIngredient(id);

	if (!ingredient) {
		return {
			title: "Mystery ingredient",
		};
	}

	return {
		title: ingredient.name,
	};
}
