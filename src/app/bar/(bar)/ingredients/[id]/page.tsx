import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteIngredient } from "@/features/ingredients/actions/deleteIngredient";
import { readIngredient } from "@/features/ingredients/actions/readIngredient";
import { DeleteIngredient } from "@/features/ingredients/components/DeleteIngredient";
import { IngredientChips } from "@/features/ingredients/components/IngredientChips";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { getRecipesUsingIngredient } from "@/features/ingredients/utils/getRecipesUsingIngredient";
import { readOrganisationMembers } from "@/features/organisation/actions/readOrganisationMembers";
import { readBarRecipes } from "@/features/recipes/actions/readBarRecipes";
import { RecipeTable } from "@/features/recipes/components/RecipeTable";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string }>;
};

export default async function IngredientPage({ params }: Props) {
	const { id } = await params;
	const [ingredient, recipes, members] = await Promise.all([
		readIngredient(id),
		readBarRecipes(),
		readOrganisationMembers(),
	]);

	if (!ingredient) {
		return notFound();
	}

	const recipesUsingIngredient = getRecipesUsingIngredient(
		ingredient.id,
		recipes,
	);

	return (
		<Container as="article" className={styles.container}>
			<Grid gap={4} justifyContent="center" className={styles.content}>
				<header>
					{ingredient.category ? (
						<Text as="div" size={2} compact>
							{CATEGORY_TO_LABEL.get(ingredient.category)}
						</Text>
					) : null}

					<Heading level="h1">{ingredient.name}</Heading>
				</header>

				<hr />

				<IngredientChips
					ingredient={ingredient}
					recipesCount={recipesUsingIngredient.length}
				/>

				<hr />

				{ingredient.description ? (
					<Text as="p" heavy>
						{ingredient.description}
					</Text>
				) : null}
			</Grid>

			<Flex
				as="menu"
				gap={4}
				className={styles.actions}
				justifyContent="center"
			>
				<LinkButton
					href={`/bar/ingredients/${id}/edit`}
					variant="outline"
					color="heavy"
					size="small"
				>
					Edit
				</LinkButton>

				<DeleteIngredient
					ingredient={ingredient}
					aria-disabled={recipesUsingIngredient.length > 0}
					disabledReason={
						recipesUsingIngredient.length > 0 ? (
							<>
								This ingredient is used in recipes and{" "}
								<strong>cannot be deleted</strong>. Remove it from all recipes
								first.
							</>
						) : undefined
					}
					action={deleteIngredient.bind(null, {
						id: ingredient.id,
						redirectTo: "/bar/ingredients",
					})}
				>
					<Icon name="trash" /> Delete
				</DeleteIngredient>
			</Flex>

			{recipesUsingIngredient.length > 0 ? (
				<Grid as="aside" gap={4} justifyItems="center">
					<Heading level="h2" size={4} className={styles.heading}>
						{recipesUsingIngredient.length}{" "}
						{recipesUsingIngredient.length === 1 ? "recipe" : "recipes"} use{" "}
						{ingredient.name}
					</Heading>

					<RecipeTable
						recipes={recipesUsingIngredient}
						members={members}
						defaultView="card"
						disableSearch
					/>
				</Grid>
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
