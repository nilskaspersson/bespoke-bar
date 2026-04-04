"use client";

import clsx from "clsx";
import type { Ref } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RecipeActions } from "@/features/recipes/actions/components/RecipeActions";
import { MotionRecipeCard } from "@/features/recipes/components/MotionRecipeCard";
import { OverscrollList } from "@/features/recipes/components/OverscrollList";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeNameAdornment } from "@/features/recipes/components/RecipeNameAdornment";
import { useRecipeCardModal } from "@/features/recipes/stores/recipeCardModal";
import { Grid } from "@/ui/Grid";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { handleKey } from "@/utils/keyboard";
import styles from "./styles.module.css";

export function RecipesList({
	recipes,
	favoriteRecipeIds,
	withActions,
	ref,
	withMotion = true,
}: {
	recipes: RecipeWithSpecs[];
	favoriteRecipeIds?: string[];
	withActions?: boolean;
	ref?: Ref<HTMLUListElement>;
	withMotion?: boolean;
}) {
	const favoriteIdSet = new Set(favoriteRecipeIds);
	const setRecipe = useRecipeCardModal((s) => s.setRecipe);
	const selectedRecipeId = useRecipeCardModal((s) => s.recipe?.id);
	const modalMounted = useRecipeCardModal((s) => s.mounted);

	if (recipes.length === 0) {
		return null;
	}

	return (
		<OverscrollList ref={ref} padding={6} gap={4}>
			{recipes.map((recipe) => {
				const isFavorite = favoriteIdSet.has(recipe.id);
				const isSelected =
					withActions && selectedRecipeId === recipe.id && modalMounted;
				const selectRecipe = () => setRecipe(recipe, isFavorite);

				return (
					<OverscrollList.Item key={recipe.id}>
						<MotionRecipeCard
							withMotion={withMotion && !isSelected}
							recipe={recipe}
							onClick={selectRecipe}
							onKeyDown={handleKey([
								["Enter", selectRecipe],
								[" ", selectRecipe],
							])}
							role="button"
							tabIndex={0}
							className={clsx({
								[styles.pointer]: withMotion,
								[styles.hidden]: isSelected,
							})}
						>
							<RecipeCard
								recipe={recipe}
								withLink={!withMotion}
								nameAdornment={<RecipeNameAdornment />}
							/>
						</MotionRecipeCard>

						{withActions ? (
							<RecipeActions
								recipe={recipe}
								withLink
								isFavorite={isFavorite}
								className={styles.actions}
							/>
						) : null}
					</OverscrollList.Item>
				);
			})}
		</OverscrollList>
	);
}

export function RecipesListSkeleton() {
	return (
		<SkeletonScreen>
			<Grid gap={4}>
				<Skeleton width="100%" height="169px" />
				<Skeleton width="100%" height="169px" />
				<Skeleton width="100%" height="169px" />
			</Grid>
		</SkeletonScreen>
	);
}

RecipesList.Skeleton = RecipesListSkeleton;
