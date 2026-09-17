"use client";

import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { useMediaQuery } from "@bespoke/ui/hooks/useMediaQuery";
import { useAdjustments } from "@bespoke/ui/RecipeAdjustments";
import { RecipeCard } from "@bespoke/ui/RecipeCard";
import styles from "./styles.module.css";

const COLUMNS = 3;
const NARROW_COLUMNS = 2;

/**
 * Cards stack at their natural height, so a column renders its cards twice and
 * slides by exactly one copy; the wrap then lands on identical content. One
 * copy must be at least as tall as the window (`--wall-visible-cards`) for the
 * trailing edge to stay covered through the loop.
 */
const CARDS_PER_COLUMN = 7;
const COPIES = [0, 1];

/** Paired with the `.column` rule that hides the third column before hydration. */
const NARROW_QUERY = "(width < 800px)";

export function HeroRecipeWall({ recipes }: { recipes: BaseRecipe[] }) {
	const { servings, conversionSystem, withRounding, withBestUnit } =
		useAdjustments();
	const narrow = useMediaQuery(NARROW_QUERY);

	if (recipes.length === 0) {
		return null;
	}

	const columnCount = narrow ? NARROW_COLUMNS : COLUMNS;
	const columns = Array.from({ length: columnCount }, (_, column) =>
		Array.from(
			{ length: CARDS_PER_COLUMN },
			(_, row) =>
				recipes[
					(column * CARDS_PER_COLUMN + row) % recipes.length
				] as BaseRecipe,
		),
	);

	return (
		<div className={styles.backdrop} aria-hidden="true" inert>
			<div className={styles.wall}>
				<div className={styles.window}>
					{columns.map((cards, column) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed grid, see docblock
						<div key={column} className={styles.column}>
							{COPIES.map((copy) =>
								cards.map((recipe) => (
									<RecipeCard
										key={`${recipe.name}-${copy}`}
										isPublic
										withLink={false}
										animateNumbers={false}
										recipe={recipe}
										servings={servings}
										convertUnits={conversionSystem}
										withRounding={withRounding}
										withBestUnit={withBestUnit}
										className={styles.card}
									/>
								)),
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
