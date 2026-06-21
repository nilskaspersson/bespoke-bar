"use client";

import {
	buildIngredientIndex,
	type IngredientIndex,
} from "@bespoke/domain/ingredients/buildIngredientIndex";
import { collator } from "@bespoke/domain/utils/collator";
import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { getIngredientId } from "@/features/ingredients/utils";
import { normalizeInput } from "@/utils";
import { createSearchIndex, type SearchIndex } from "@/utils/search";

type RecipeIngredientsValue = {
	sortedIngredients: Ingredient[];
	ingredientIndex: IngredientIndex;
	searchIndex: SearchIndex<Ingredient>;
	knownNames: Set<string>;
};

const RecipeIngredientsContext = createContext<RecipeIngredientsValue | null>(
	null,
);

const getSearchFields = (i: Ingredient) => {
	const fields = [i.name];
	const categoryLabel = i.category ? CATEGORY_TO_LABEL.get(i.category) : null;
	if (categoryLabel) fields.push(categoryLabel);
	return fields;
};

/**
 * Compute every ingredient-derived structure the editor plugins need once,
 * then share them via context.
 */
export function RecipeIngredientsProvider({
	ingredients,
	children,
}: {
	ingredients: Ingredient[];
	children: ReactNode;
}) {
	const value = useMemo<RecipeIngredientsValue>(() => {
		const sortedIngredients = ingredients.toSorted((a, b) =>
			collator.compare(a.name, b.name),
		);
		const ingredientIndex = buildIngredientIndex(ingredients);
		const searchIndex = createSearchIndex(
			sortedIngredients,
			getIngredientId,
			getSearchFields,
		);
		const knownNames = new Set(
			sortedIngredients.map((i) => normalizeInput(i.name)),
		);
		return { sortedIngredients, ingredientIndex, searchIndex, knownNames };
	}, [ingredients]);

	return (
		<RecipeIngredientsContext.Provider value={value}>
			{children}
		</RecipeIngredientsContext.Provider>
	);
}

export function useRecipeIngredients() {
	const value = useContext(RecipeIngredientsContext);
	if (!value) {
		throw new Error(
			"useRecipeIngredients must be used inside <RecipeIngredientsProvider>",
		);
	}
	return value;
}
