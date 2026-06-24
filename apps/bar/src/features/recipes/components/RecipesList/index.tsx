"use client";

import type { RecipeWithRelations } from "@bespoke/schema/schema/recipes";
import type { Tag } from "@bespoke/schema/schema/tags";
import { Grid } from "@bespoke/ui/Grid";
import { Skeleton, SkeletonScreen } from "@bespoke/ui/Skeleton";
import clsx from "clsx";
import { type ComponentProps, memo, useMemo, useRef } from "react";
import { RecipeCardActions } from "@/features/recipes/actions/components/RecipeCardActions";
import { CreateRecipeSlot } from "@/features/recipes/components/CreateRecipeSlot";
import { RecipeListCard } from "@/features/recipes/components/RecipeListCard";
import { RecipeTagsAction } from "@/features/tags/components/RecipeTagsAction";
import { useInView } from "@/hooks/useInView";
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
		<div className={styles.actions}>
			{tagOptions ? (
				<RecipeTagsAction recipe={recipe} tagOptions={tagOptions} />
			) : null}

			<RecipeCardActions
				recipe={recipe}
				isFavorite={isFavorite}
				className={styles.cardActions}
			/>
		</div>
	);
});

type ListProps = ComponentProps<"ul"> & {
	recipes: RecipeWithRelations[];
	favoriteRecipeIds?: string[];
	tagOptions?: Tag[];
	withActions?: boolean;
	withCreate?: boolean;
};

const EAGER_CARD_COUNT = 12;

/**
 * Owns the per-item IntersectionObserver and gates BOTH the card and its actions
 * row behind visibility — so an off-screen item mounts neither the full card body
 * nor the actions subtree (just a name placeholder). `.item`'s
 * `contain-intrinsic-size` reserves the full height, so collapsing is shift-free.
 */
const RecipeListItem = memo(function RecipeListItem({
	recipe,
	isFavorite,
	tagOptions,
	withActions,
	eager,
}: {
	recipe: RecipeWithRelations;
	isFavorite: boolean;
	tagOptions?: Tag[];
	withActions?: boolean;
	eager: boolean;
}) {
	const ref = useRef<HTMLLIElement>(null);

	const inView = useInView(ref, {
		rootMargin: "200px 0px",
		initialInView: eager,
	});

	return (
		<Grid as="li" ref={ref} gap={1} className={styles.item}>
			<RecipeListCard
				recipe={recipe}
				isFavorite={isFavorite}
				tagOptions={tagOptions}
				clickable={withActions}
				inView={inView}
			/>

			{withActions &&
				(inView ? (
					<RecipeListActions
						recipe={recipe}
						isFavorite={isFavorite}
						tagOptions={tagOptions}
					/>
				) : (
					<div aria-hidden className={styles.actions} />
				))}
		</Grid>
	);
});

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
			{recipes.map((recipe, index) => (
				<RecipeListItem
					key={recipe.id}
					recipe={recipe}
					isFavorite={favoriteIdSet.has(recipe.id)}
					tagOptions={tagOptions}
					withActions={withActions}
					eager={index < EAGER_CARD_COUNT}
				/>
			))}

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

							<div className={styles.actions} />
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
