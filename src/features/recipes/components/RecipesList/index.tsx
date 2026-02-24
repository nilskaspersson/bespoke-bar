"use client";

import type { Ref } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RecipeActions } from "@/features/recipes/actions/components/RecipeActions";
import { MotionRecipeCard } from "@/features/recipes/components/MotionRecipeCard";
import { OverscrollList } from "@/features/recipes/components/OverscrollList";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { useRecipeCardModal } from "@/features/recipes/stores/recipeCardModal";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import styles from "./styles.module.css";

export function RecipesList({
	recipes,
	favoriteRecipeIds,
	withActions,
	ref,
}: {
	recipes: RecipeWithSpecs[];
	favoriteRecipeIds?: string[];
	withActions?: boolean;
	ref?: Ref<HTMLUListElement>;
}) {
	const favoriteIdSet = new Set(favoriteRecipeIds);
	const setRecipe = useRecipeCardModal((s) => s.setRecipe);
	const selectedRecipeId = useRecipeCardModal((s) => s.recipe?.id);

	if (recipes.length === 0) {
		return null;
	}

	const nameAdornment = (
		<Icon name="duotone-martini-glass" size={3} className={styles.icon} />
	);

	return (
		<OverscrollList ref={ref} padding={6} gap={4}>
			{recipes.map((recipe) => {
				const isSelected = withActions && selectedRecipeId === recipe.id;

				return (
					<OverscrollList.Item key={recipe.id}>
						{!withActions ? (
							<RecipeCard
								recipe={recipe}
								className={styles.card}
								nameAdornment={nameAdornment}
							/>
						) : isSelected ? (
							<div style={{ visibility: "hidden" }}>
								<MotionRecipeCard.Placeholder recipe={recipe} />
								<RecipeActions
									recipe={recipe}
									withLink
									isFavorite={favoriteIdSet.has(recipe.id)}
									className={styles.actions}
								/>
							</div>
						) : (
							<>
								<MotionRecipeCard
									recipe={recipe}
									onClick={() =>
										setRecipe(recipe, favoriteIdSet.has(recipe.id))
									}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											setRecipe(recipe, favoriteIdSet.has(recipe.id));
										}
									}}
									role="button"
									tabIndex={0}
									className={styles.motionWrapper}
								/>

								<RecipeActions
									recipe={recipe}
									withLink
									isFavorite={favoriteIdSet.has(recipe.id)}
									className={styles.actions}
								/>
							</>
						)}
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
