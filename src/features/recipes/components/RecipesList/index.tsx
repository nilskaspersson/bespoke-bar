"use client";

import clsx from "clsx";
import type { ComponentProps } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RecipeCardActions } from "@/features/recipes/actions/components/RecipeCardActions";
import { CreateRecipeSlot } from "@/features/recipes/components/CreateRecipeSlot";
import { MotionRecipeCard } from "@/features/recipes/components/MotionRecipeCard";
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
	withMotion = true,
	withCreate,
	...props
}: ComponentProps<"ul"> & {
	recipes: RecipeWithSpecs[];
	favoriteRecipeIds?: string[];
	withActions?: boolean;
	withMotion?: boolean;
	withCreate?: boolean;
}) {
	const favoriteIdSet = new Set(favoriteRecipeIds);
	const setRecipe = useRecipeCardModal((s) => s.setRecipe);
	const selectedRecipeId = useRecipeCardModal((s) => s.recipe?.id);
	const modalMounted = useRecipeCardModal((s) => s.mounted);

	if (recipes.length === 0) {
		return null;
	}

	return (
		<ul {...props} className={clsx(props.className, styles.list)}>
			{recipes.map((recipe) => {
				const isFavorite = favoriteIdSet.has(recipe.id);
				const isSelected =
					withActions && selectedRecipeId === recipe.id && modalMounted;
				const selectRecipe = () => setRecipe(recipe, isFavorite);

				return (
					<Grid as="li" gap={1} key={recipe.id} className={styles.item}>
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
							<RecipeCardActions recipe={recipe} isFavorite={isFavorite} />
						) : undefined}
					</Grid>
				);
			})}

			{withCreate ? (
				<li className={styles.item}>
					<CreateRecipeSlot />
				</li>
			) : null}
		</ul>
	);
}

export function RecipesListSkeleton({
	count = 6,
	className,
}: {
	count?: number;
	className?: string;
}) {
	return (
		<SkeletonScreen>
			<ul className={clsx(className, styles.list)}>
				{Array.from({ length: count }, (_, i) => (
					<li
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no identity
						key={i}
						className={styles.item}
					>
						<div className={styles.skeletonCard}>
							<Skeleton
								className={styles.cardSkeleton}
								width="var(--recipe-card-width)"
								height="var(--recipe-card-height)"
							/>
							<div className={styles.skeletonActions} />
						</div>
					</li>
				))}
			</ul>
		</SkeletonScreen>
	);
}

RecipesList.Skeleton = RecipesListSkeleton;
