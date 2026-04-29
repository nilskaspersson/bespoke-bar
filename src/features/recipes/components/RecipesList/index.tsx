"use client";

import clsx from "clsx";
import { type ComponentProps, memo, useMemo } from "react";
import type { RecipeWithRelations } from "@/db/schema/recipes";
import type { Tag } from "@/db/schema/tags";
import { RecipeCardActions } from "@/features/recipes/actions/components/RecipeCardActions";
import { CreateRecipeSlot } from "@/features/recipes/components/CreateRecipeSlot";
import { RecipeListCard } from "@/features/recipes/components/RecipeListCard";
import { RecipeTagsAction } from "@/features/tags/components/RecipeTagsAction";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import styles from "./styles.module.css";

type ActionsProps = {
	recipe: RecipeWithRelations;
	isFavorite: boolean;
	tagOptions?: Tag[];
};

const RecipeListActions = memo(function RecipeListActions({
	recipe,
	isFavorite,
	tagOptions,
}: ActionsProps) {
	return (
		<Flex gap={4} justifyContent="space-between">
			{tagOptions ? (
				<RecipeTagsAction recipe={recipe} tagOptions={tagOptions} />
			) : null}

			<RecipeCardActions recipe={recipe} isFavorite={isFavorite} />
		</Flex>
	);
});

type ListProps = ComponentProps<"ul"> & {
	recipes: RecipeWithRelations[];
	favoriteRecipeIds?: string[];
	tagOptions?: Tag[];
	withActions?: boolean;
	withCreate?: boolean;
};

function RecipesListImpl({
	recipes,
	favoriteRecipeIds,
	tagOptions,
	withActions,
	withCreate,
	...props
}: ListProps) {
	const favoriteIdSet = useMemo(
		() => new Set(favoriteRecipeIds),
		[favoriteRecipeIds],
	);

	return (
		<ul {...props} className={clsx(props.className, styles.list)}>
			{recipes.map((recipe) => {
				const isFavorite = favoriteIdSet.has(recipe.id);
				return (
					<Grid as="li" gap={1} key={recipe.id} className={styles.item}>
						<RecipeListCard
							recipe={recipe}
							isFavorite={isFavorite}
							tagOptions={tagOptions}
							clickable={!!withActions}
						/>
						{withActions ? (
							<RecipeListActions
								recipe={recipe}
								isFavorite={isFavorite}
								tagOptions={tagOptions}
							/>
						) : null}
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

export const RecipesList = Object.assign(memo(RecipesListImpl), {
	Skeleton: RecipesListSkeleton,
});
