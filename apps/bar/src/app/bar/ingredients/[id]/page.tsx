import { authOrForbidden } from "@bespoke/api/auth";
import { getCachedIngredient } from "@bespoke/api/ingredients/readIngredient";
import { getCachedIngredients } from "@bespoke/api/ingredients/readIngredients";
import { getCachedBarRecipes } from "@bespoke/api/recipes/readBarRecipes";
import { getCachedUserFavoriteRecipeIds } from "@bespoke/api/recipes/readUserFavoriteRecipeIds";
import { getCachedTags } from "@bespoke/api/tags/listTags";
import { stitchRecipes } from "@bespoke/domain/recipes/stitchRecipe";
import { pluralize } from "@bespoke/domain/utils/formatting";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BottomRailItems } from "@/components/BottomRail";
import { EnrichmentMark } from "@/components/EnrichmentMark";
import { DeleteIngredient } from "@/features/ingredients/actions/components/DeleteIngredient";
import { EditIngredientButton } from "@/features/ingredients/components/EditIngredientButton";
import { IngredientChips } from "@/features/ingredients/components/IngredientChips";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { getRecipesUsingIngredient } from "@/features/ingredients/utils/getRecipesUsingIngredient";
import {
	RecipesList,
	RecipesListSkeleton,
} from "@/features/recipes/components/RecipesList";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";
import { Icon } from "@/ui/Icon";
import { Skeleton } from "@/ui/Skeleton";
import { Text } from "@/ui/Text";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string }>;
};

export default function IngredientPage({ params }: Props) {
	return (
		<article>
			<Suspense fallback={<IngredientPageSkeleton />}>
				<IngredientWithAuth params={params} />
			</Suspense>
		</article>
	);
}

function IngredientPageSkeleton() {
	return (
		<Grid gap={9}>
			<Grid as="section" gap={6}>
				<Grid gap={2}>
					<Skeleton variant="text" width="6rem" height="0.9rem" />
					<Skeleton variant="text" width="min(60%, 20rem)" height="2.5rem" />
				</Grid>

				<Flex gap={2} wrap>
					<Skeleton variant="text" width="5rem" height="1.75rem" />
					<Skeleton variant="text" width="4.5rem" height="1.75rem" />
					<Skeleton variant="text" width="6.5rem" height="1.75rem" />
				</Flex>

				<Grid gap={2}>
					<Skeleton variant="text" width="100%" height="1rem" />
					<Skeleton variant="text" width="72%" height="1rem" />
				</Grid>
			</Grid>

			<Grid gap={4}>
				<Skeleton variant="text" width="11rem" height="1.5rem" />
				<RecipesListSkeleton count={3} />
			</Grid>
		</Grid>
	);
}

async function IngredientWithAuth({ params }: Props) {
	const { id } = await params;

	if (!id) {
		notFound();
	}

	const { orgId, userId } = await authOrForbidden();

	const [ingredient, rawRecipes, ingredients, tags, favoriteRecipeIds] =
		await Promise.all([
			getCachedIngredient(orgId, id),
			getCachedBarRecipes(orgId),
			getCachedIngredients(orgId),
			getCachedTags(orgId),
			getCachedUserFavoriteRecipeIds(orgId, userId),
		]);

	if (!ingredient) {
		return notFound();
	}

	const recipes = stitchRecipes(rawRecipes, { ingredients, tags });
	const recipesUsingIngredient = getRecipesUsingIngredient(
		ingredient.id,
		recipes,
	);

	const enrichedFields = new Set(ingredient.aiEnrichedFields ?? []);

	return (
		<>
			<Grid gap={9}>
				<Grid as="section" gap={6}>
					<HGroup
						floatingOverline
						overline={
							ingredient.category
								? CATEGORY_TO_LABEL.get(ingredient.category)
								: null
						}
					>
						<Heading level="h1" size={7}>
							{ingredient.name}
						</Heading>
					</HGroup>

					<IngredientChips
						ingredient={ingredient}
						recipesCount={recipesUsingIngredient.length}
						justifyContent="flex-start"
						editable
					/>

					{ingredient.description ? (
						<Flex gap={2} alignItems="baseline">
							{enrichedFields.has("description") ? <EnrichmentMark /> : null}

							<Text as="p" heavy>
								{ingredient.description}
							</Text>
						</Flex>
					) : null}
				</Grid>

				{recipesUsingIngredient.length > 0 ? (
					<Grid as="aside" gap={4}>
						<Heading level="h2" size={4}>
							Used in {recipesUsingIngredient.length}{" "}
							{pluralize(recipesUsingIngredient.length, "recipe")}:
						</Heading>

						<RecipesList
							recipes={recipesUsingIngredient}
							favoriteRecipeIds={favoriteRecipeIds}
							tagOptions={tags}
							withActions
							className={styles.usageList}
						/>
					</Grid>
				) : null}
			</Grid>

			<BottomRailItems>
				<EditIngredientButton
					ingredient={ingredient}
					variant="clear"
					color="heavy"
					rounded
				>
					Edit
				</EditIngredientButton>

				<DeleteIngredient
					ingredient={ingredient}
					redirectTo="/bar/ingredients"
					variant="clear"
					size="default"
					rounded
					aria-disabled={recipesUsingIngredient.length > 0}
					icon
					notice={
						recipesUsingIngredient.length > 0 ? (
							<>
								This ingredient is used by Recipes and{" "}
								<strong>cannot be deleted</strong>. Remove it from all Recipes
								first.
							</>
						) : undefined
					}
				>
					<Icon name="trash" />
				</DeleteIngredient>
			</BottomRailItems>
		</>
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
