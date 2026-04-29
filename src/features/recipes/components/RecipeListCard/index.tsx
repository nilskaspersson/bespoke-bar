"use client";

import clsx from "clsx";
import { memo } from "react";
import type { RecipeWithRelations } from "@/db/schema/recipes";
import type { Tag } from "@/db/schema/tags";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeNameAdornment } from "@/features/recipes/components/RecipeNameAdornment";
import { useRecipeCardModal } from "@/features/recipes/stores/recipeCardModal";
import { recipeCardSourceProps } from "@/features/recipes/utils/recipeCardSource";
import { handleKey } from "@/utils/keyboard";
import styles from "./styles.module.css";

type Props = {
	recipe: RecipeWithRelations;
	isFavorite: boolean;
	tagOptions?: Tag[];
	clickable: boolean;
};

export const RecipeListCard = memo(function RecipeListCard({
	recipe,
	isFavorite,
	tagOptions,
	clickable,
}: Props) {
	const open = useRecipeCardModal((s) => s.open);
	const isHidden = useRecipeCardModal(
		(s) =>
			clickable &&
			(s.current?.recipe.id === recipe.id || s.exitingId === recipe.id),
	);

	const selectRecipe = (
		event:
			| React.MouseEvent<HTMLDivElement>
			| React.KeyboardEvent<HTMLDivElement>,
	) => {
		const rect = event.currentTarget.getBoundingClientRect();
		open(recipe, isFavorite, tagOptions, rect);
	};

	if (!clickable) {
		return (
			<div {...recipeCardSourceProps(recipe)}>
				<RecipeCard
					recipe={recipe}
					withLink
					nameAdornment={<RecipeNameAdornment />}
				/>
			</div>
		);
	}

	return (
		// biome-ignore lint/a11y/useSemanticElements: card subtree contains other interactive elements; a real <button> would nest interactives.
		<div
			{...recipeCardSourceProps(recipe)}
			onClick={selectRecipe}
			onKeyDown={handleKey([
				["Enter", selectRecipe],
				[" ", selectRecipe],
			])}
			role="button"
			tabIndex={0}
			className={clsx(styles.pointer, {
				[styles.hidden]: isHidden,
			})}
		>
			<RecipeCard recipe={recipe} nameAdornment={<RecipeNameAdornment />} />
		</div>
	);
});
