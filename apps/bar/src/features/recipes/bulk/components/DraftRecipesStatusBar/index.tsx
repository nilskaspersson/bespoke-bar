"use client";

import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { Text } from "@bespoke/ui/Text";
import { useMemo } from "react";

export function DraftRecipesStatusBar({ recipes }: { recipes: BaseRecipe[] }) {
	const recipeCount = recipes.length;

	const newIngredientCount = useMemo(() => {
		const names = new Set<string>();
		for (const recipe of recipes) {
			for (const line of recipe.lines ?? []) {
				if (!line.ingredientId && line.ingredient?.name) {
					names.add(line.ingredient.name.toLowerCase());
				}
			}
		}
		return names.size;
	}, [recipes]);

	return (
		<Text as="div" size={0} light numeric>
			{recipeCount} new {recipeCount === 1 ? "Recipe" : "Recipes"},{" "}
			{newIngredientCount} new{" "}
			{newIngredientCount === 1 ? "Ingredient" : "Ingredients"}
		</Text>
	);
}
