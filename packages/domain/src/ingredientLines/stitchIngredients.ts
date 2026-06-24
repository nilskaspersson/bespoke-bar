import type { MenuWithRecipes } from "@bespoke/schema/schema/composite";
import type {
	IngredientLine,
	IngredientLineWithIngredient,
} from "@bespoke/schema/schema/ingredientLines";
import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import type { MenuEntryWithRecipe } from "@bespoke/schema/schema/menuEntries";

export type IngredientMap = Map<Ingredient["id"], Ingredient>;

export function buildIngredientMap(ingredients: Ingredient[]): IngredientMap {
	return new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
}

function makeFallbackIngredient(line: IngredientLine): Ingredient {
	return {
		id: line.ingredientId,
		name: "Unknown ingredient",
		normalizedName: "unknown ingredient",
		description: null,
		category: null,
		abv: null,
		brand: null,
		unitCost: null,
		measurementType: null,
		orgId: "",
		createdAt: "",
		createdBy: "",
		updatedAt: null,
		updatedBy: null,
		aiEnrichedFields: null,
	};
}

export function stitchLines(
	lines: IngredientLine[],
	ingredients: IngredientMap,
): IngredientLineWithIngredient[] {
	return lines.map((line) => {
		const ingredient =
			ingredients.get(line.ingredientId) ?? makeFallbackIngredient(line);
		return { ...line, ingredient };
	});
}

export function stitchMenuEntries(
	menu: MenuWithRecipes<IngredientLine>,
	ingredients: IngredientMap,
): MenuWithRecipes {
	return {
		...menu,
		entries: menu.entries.map(
			(entry): MenuEntryWithRecipe => ({
				...entry,
				recipe: {
					...entry.recipe,
					lines: stitchLines(entry.recipe.lines, ingredients),
				},
			}),
		),
	};
}
