import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrgProvider } from "@/components/OrgProvider";
import { DeleteIngredient } from "@/features/ingredients/actions/components/DeleteIngredient";
import { deleteIngredient } from "@/features/ingredients/api/deleteIngredient";
import { getCachedIngredient } from "@/features/ingredients/api/readIngredient";
import { IngredientChips } from "@/features/ingredients/components/IngredientChips";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { getRecipesUsingIngredient } from "@/features/ingredients/utils/getRecipesUsingIngredient";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { RecipesList } from "@/features/recipes/components/RecipesList";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { Text } from "@/ui/Text";
import { authOrForbidden } from "@/utils/auth";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string }>;
};

export default function IngredientPage({ params }: Props) {
	return (
		<Container as="article" className={styles.container}>
			<Suspense
				fallback={
					<SkeletonScreen>
						<Skeleton width="100%" height="60lvh" />
					</SkeletonScreen>
				}
			>
				<IngredientWithAuth params={params} />
			</Suspense>
		</Container>
	);
}

async function IngredientWithAuth({ params }: Props) {
	const { id } = await params;

	if (!id) {
		notFound();
	}

	const { orgId } = await authOrForbidden();

	const [ingredient, recipes] = await Promise.all([
		getCachedIngredient(orgId, id),
		getCachedBarRecipes(orgId),
	]);

	if (!ingredient) {
		return notFound();
	}

	const recipesUsingIngredient = getRecipesUsingIngredient(
		ingredient.id,
		recipes,
	);

	return (
		<OrgProvider>
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
					notice={
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

					<RecipesList recipes={recipesUsingIngredient} withActions />
				</Grid>
			) : null}
		</OrgProvider>
	);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;

	if (!id) {
		return {
			title: "Ingredient not found",
		};
	}

	const { orgId } = await authOrForbidden();
	const ingredient = await getCachedIngredient(orgId, id);

	if (!ingredient) {
		return {
			title: "Ingredient not found",
		};
	}

	return {
		title: ingredient.name,
	};
}
