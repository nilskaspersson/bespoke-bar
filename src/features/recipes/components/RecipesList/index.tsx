"use client";

import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RecipeCardActions } from "@/features/recipes/actions/components/RecipeCardActions";
import { MotionRecipeCard } from "@/features/recipes/components/MotionRecipeCard";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeNameAdornment } from "@/features/recipes/components/RecipeNameAdornment";
import { useRecipeCardModal } from "@/features/recipes/stores/recipeCardModal";
import { Icon } from "@/ui/Icon";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { handleKey } from "@/utils/keyboard";
import styles from "./styles.module.css";

export function RecipesList({
	recipes,
	favoriteRecipeIds,
	withActions,
	withMotion = true,
	...props
}: ComponentProps<"ul"> & {
	recipes: RecipeWithSpecs[];
	favoriteRecipeIds?: string[];
	withActions?: boolean;
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
		<ul {...props} className={clsx(props.className, styles.list)}>
			{recipes.map((recipe) => {
				const isFavorite = favoriteIdSet.has(recipe.id);
				const isSelected =
					withActions && selectedRecipeId === recipe.id && modalMounted;
				const selectRecipe = () => setRecipe(recipe, isFavorite);

				return (
					<li key={recipe.id} className={styles.item}>
						<RecipeCard
							recipe={recipe}
							withLink={!withMotion}
							nameAdornment={<RecipeNameAdornment />}
							cardWrapper={(card) => (
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
									{card}
								</MotionRecipeCard>
							)}
							footer={
								withActions ? (
									<RecipeCardActions
										recipe={recipe}
										isFavorite={isFavorite}
										withLink
									/>
								) : undefined
							}
						/>
					</li>
				);
			})}

			<li className={styles.item}>
				<Link href="/bar/recipes/create" className={styles.createSlot}>
					<Icon name="plus" size={3} />
					Create Recipe
				</Link>
			</li>
		</ul>
	);
}

export function RecipesListSkeleton({ count = 6 }: { count?: number }) {
	return (
		<SkeletonScreen>
			<ul className={styles.list}>
				{Array.from({ length: count }, (_, i) => (
					<li
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no identity
						key={i}
						className={styles.item}
					>
						<Skeleton
							className={styles.cardSkeleton}
							width="var(--recipe-card-width)"
							height="var(--recipe-card-height)"
						/>
					</li>
				))}
			</ul>
		</SkeletonScreen>
	);
}

RecipesList.Skeleton = RecipesListSkeleton;
