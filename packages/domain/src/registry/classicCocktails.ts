import type { DraftIngredientLineWithDraftIngredient } from "@bespoke/schema/schema/ingredientLines";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { KEY_NAME, type WithKey } from "@bespoke/schema/types";
import { CATEGORY_DEFAULT_ABV } from "../categories/constants";
import { getMeasurementFromUnit } from "../units/getMeasurementFromUnit";
import data from "./classicCocktails.json";
import type { ClassicCocktail } from "./classicCocktails.zod";

const classicsByName = new Map(
	(data.cocktails as ClassicCocktail[]).map((cocktail) => [
		cocktail.name,
		cocktail,
	]),
);

function toLine(
	cocktail: ClassicCocktail,
	ingredient: ClassicCocktail["ingredients"][number],
	index: number,
): WithKey<DraftIngredientLineWithDraftIngredient> {
	return {
		[KEY_NAME]: `${cocktail.name}:${index}`,
		quantity: ingredient.quantity,
		unit: ingredient.unit,
		optional: ingredient.optional,
		ingredient: {
			name: ingredient.name,
			category: ingredient.category,
			brand: ingredient.brand,
			abv: CATEGORY_DEFAULT_ABV.get(ingredient.category) ?? null,
			measurementType: getMeasurementFromUnit(ingredient.unit),
		},
	};
}

export function getClassicCocktail(name: string): BaseRecipe {
	const cocktail = classicsByName.get(name);

	if (!cocktail) {
		throw new Error(`Unknown classic cocktail: ${name}`);
	}

	return {
		name: cocktail.name,
		style: cocktail.style,
		preparationMethod: cocktail.preparationMethod,
		ice: cocktail.ice,
		garnish: cocktail.garnish,
		lines: cocktail.ingredients.map((ingredient, index) =>
			toLine(cocktail, ingredient, index),
		),
	};
}

export function getClassicCocktails(names: readonly string[]): BaseRecipe[] {
	return names.map(getClassicCocktail);
}
