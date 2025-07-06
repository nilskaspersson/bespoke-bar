import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteIngredient } from "@/features/ingredients/actions/deleteIngredient";
import { readIngredient } from "@/features/ingredients/actions/readIngredient";
import { DeleteIngredient } from "@/features/ingredients/components/DeleteIngredient";
import { getRecipesUsingIngredient } from "@/features/ingredients/utils/getRecipesUsingIngredient";
import { readBarRecipes } from "@/features/recipes/actions/readBarRecipes";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { getRecipeUrl } from "@/features/recipes/utils";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Flex } from "@/ui/Flex";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import { getKey } from "@/utils/withKey";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string }>;
};

export default async function IngredientPage({ params }: Props) {
	const { id } = await params;
	const [ingredient, recipes] = await Promise.all([
		readIngredient(id),
		readBarRecipes(),
	]);

	if (!ingredient) {
		return notFound();
	}

	const recipesUsingIngredient = getRecipesUsingIngredient(
		ingredient.id,
		recipes,
	);

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

			<LinkButton
				href={`/bar/ingredients/${id}/edit`}
				variant="outline"
				color="heavy"
				size="small"
			>
				Edit
			</LinkButton>

			<Text as="p">{ingredient.category}</Text>
			<Text as="p">{ingredient.abv}</Text>
			<Text as="p">{ingredient.brand}</Text>
			<Text as="p">{ingredient.unitCost}</Text>
			<Text as="p">{ingredient.measurementType}</Text>

			{recipesUsingIngredient.length > 0 ? (
				<aside>
					<Heading level="h2" size={3}>
						{recipesUsingIngredient.length}{" "}
						{recipesUsingIngredient.length === 1 ? "recipe" : "recipes"} use{" "}
						{ingredient.name}
					</Heading>

					<Flex as="ul" wrap gap={4}>
						{recipesUsingIngredient.map((recipe) => (
							<li key={getKey(recipe)}>
								<RecipeCard
									header={
										<Flex gap={4} justifyContent="space-between">
											<Heading level="h3" size={4}>
												<Link href={getRecipeUrl(recipe)} prefetch={false}>
													<RecipeName recipe={recipe} />
												</Link>
											</Heading>

											<Icon
												name="duotone-martini-glass"
												size={3}
												className={styles.icon}
											/>
										</Flex>
									}
									recipe={recipe}
								/>
							</li>
						))}
					</Flex>
				</aside>
			) : null}
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
