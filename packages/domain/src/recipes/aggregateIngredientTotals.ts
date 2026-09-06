import { normalizeIngredientName } from "@bespoke/schema/normalizeIngredientName";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import type { Unit } from "@bespoke/schema/schema/units";
import { DB_UNIT_TO_LIB_UNIT } from "../units/constants";
import { convertFactor } from "../units/convert";

export type IngredientTotal = {
	name: string;
	quantity: number | null;
	unit: Unit | null;
	volumeInMl: number;
	recipeCount: number;
	optional: boolean;
};

export type IngredientTotals = {
	ingredients: IngredientTotal[];
	totalVolumeInMl: number;
};

type Accumulator = Omit<IngredientTotal, "recipeCount"> & {
	recipes: Set<number>;
};

/**
 * The unit an ingredient's total is reported in: the first measured line's,
 * with every later line converted into it. Every Unit is volume-dimensioned,
 * so any two lines for the same ingredient can always be summed — a recipe
 * written in `cl` and one in `oz` land on whichever the reader wrote first,
 * which is the unit they are already thinking in.
 *
 * A quantity with no Unit ("1 cocktail cherry") is a count, so it is simply
 * added up and contributes no volume. Counts only accumulate while the
 * ingredient has no unit; the first measured line takes over, since a count
 * and a volume have nothing to add to each other.
 */
function addLineToTotal(
	total: Accumulator,
	quantity: number,
	unit: Unit | null | undefined,
) {
	if (!unit) {
		if (total.unit === null) {
			total.quantity = (total.quantity ?? 0) + quantity;
		}

		return;
	}

	const libUnit = DB_UNIT_TO_LIB_UNIT.get(unit);

	if (!libUnit) {
		return;
	}

	total.volumeInMl += quantity * convertFactor(libUnit, "ml");

	if (total.unit === null) {
		total.unit = unit;
		total.quantity = quantity;
		return;
	}

	const base = DB_UNIT_TO_LIB_UNIT.get(total.unit);

	if (base) {
		total.quantity =
			(total.quantity ?? 0) + quantity * convertFactor(libUnit, base);
	}
}

/**
 * Measured ingredients first, largest pour down — the order a spec reads in.
 * Unmeasured ones carry no amount to rank by, so they settle alphabetically
 * at the bottom.
 */
function byVolumeThenName(a: IngredientTotal, b: IngredientTotal): number {
	if (a.quantity === null || b.quantity === null) {
		if (a.quantity !== null) return -1;
		if (b.quantity !== null) return 1;
		return a.name.localeCompare(b.name);
	}

	return b.volumeInMl - a.volumeInMl;
}

/**
 * Rolls every Ingredient Line across a set of Draft Recipes into one total per
 * Ingredient — what the whole set costs you in bottles. Servings are
 * deliberately not applied: scaling is a display-time adjustment, so callers
 * multiply on the way out and this stays the spec as written.
 */
export function aggregateIngredientTotals(
	recipes: BaseRecipe[],
): IngredientTotals {
	const totals = new Map<string, Accumulator>();

	recipes.forEach((recipe, recipeIndex) => {
		for (const line of recipe.lines ?? []) {
			const name = line.ingredient.name?.trim();

			if (!name) {
				continue;
			}

			const key = normalizeIngredientName(name);
			let total = totals.get(key);

			if (!total) {
				total = {
					name,
					quantity: null,
					unit: null,
					volumeInMl: 0,
					optional: true,
					recipes: new Set(),
				};
				totals.set(key, total);
			}

			total.recipes.add(recipeIndex);
			total.optional &&= Boolean(line.optional);

			if (line.quantity) {
				addLineToTotal(total, line.quantity, line.unit);
			}
		}
	});

	const ingredients = [...totals.values()]
		.map(({ recipes: usedIn, ...total }) => ({
			...total,
			recipeCount: usedIn.size,
		}))
		.sort(byVolumeThenName);

	return {
		ingredients,
		totalVolumeInMl: ingredients.reduce(
			(sum, { volumeInMl }) => sum + volumeInMl,
			0,
		),
	};
}
