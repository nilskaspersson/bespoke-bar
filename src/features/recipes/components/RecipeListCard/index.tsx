"use client";

import clsx from "clsx";
import type { RecipeWithRelations } from "@/db/schema/recipes";
import type { Tag } from "@/db/schema/tags";
import { useAdjustments } from "@/features/recipes/components/RecipeAdjustments";
import {
	RecipeCard,
	RecipeCardPlaceholder,
} from "@/features/recipes/components/RecipeCard";
import { useRecipeCardModal } from "@/features/recipes/stores/recipeCardModal";
import { recipeCardSourceProps } from "@/features/recipes/utils/recipeCardSource";
import { handleKey } from "@/utils/keyboard";
import styles from "./styles.module.css";

type Props = {
	recipe: RecipeWithRelations;
	isFavorite: boolean;
	tagOptions?: Tag[];
	clickable: boolean | undefined;
	inView: boolean;
};

export function RecipeListCard({
	recipe,
	isFavorite,
	tagOptions,
	clickable,
	inView = true,
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

	const card = inView ? (
		<RecipeListCardBody recipe={recipe} withLink={!clickable} />
	) : (
		<RecipeCardPlaceholder recipe={recipe} />
	);

	if (!clickable) {
		return <div {...recipeCardSourceProps(recipe)}>{card}</div>;
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
			{card}
		</div>
	);
}

function RecipeListCardBody({
	recipe,
	withLink,
}: {
	recipe: RecipeWithRelations;
	withLink: boolean;
}) {
	const adjustments = useAdjustments();

	return (
		<RecipeCard
			recipe={recipe}
			withLink={withLink}
			servings={adjustments.servings}
			convertUnits={adjustments.conversionSystem}
			withRounding={adjustments.withRounding}
			withBestUnit={adjustments.withBestUnit}
			animateNumbers={false}
		/>
	);
}
