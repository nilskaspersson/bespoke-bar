import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";
import type { RecipeList } from "@/db/schema/recipeLists";
import {
	GLASSWARE_TO_LABEL,
	METHOD_TO_LABEL,
} from "@/features/recipes/constants";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";

export type ExportOptions = {
	includeListName: boolean;
	includeListDescription: boolean;
	includeName: boolean;
	includeDescription: boolean;
	includePrice: boolean;
	includeIngredients: boolean;
	includeSpecs: boolean;
	includeGlassware: boolean;
	includeMethod: boolean;
	includeGarnish: boolean;
	includeInstructions: boolean;
};

export type ExportableRecipeList = Pick<
	RecipeList,
	"name" | "description" | "createdAt" | "updatedAt"
> & {
	entries: RecipeListEntryWithRecipe[];
};

export type CurrencyFormatter = {
	format: (value: number) => string;
};

const defaultExportOptions: ExportOptions = {
	includeListName: false,
	includeListDescription: false,
	includeName: false,
	includeDescription: false,
	includePrice: false,
	includeIngredients: false,
	includeSpecs: false,
	includeGlassware: false,
	includeMethod: false,
	includeGarnish: false,
	includeInstructions: false,
};

export function parseExportOptions(params: URLSearchParams): ExportOptions {
	return {
		includeListName: params.get("includeListName") === "true",
		includeListDescription: params.get("includeListDescription") === "true",
		includeName: params.get("includeName") === "true",
		includeDescription: params.get("includeDescription") === "true",
		includePrice: params.get("includePrice") === "true",
		includeIngredients: params.get("includeIngredients") === "true",
		includeSpecs: params.get("includeSpecs") === "true",
		includeGlassware: params.get("includeGlassware") === "true",
		includeMethod: params.get("includeMethod") === "true",
		includeGarnish: params.get("includeGarnish") === "true",
		includeInstructions: params.get("includeInstructions") === "true",
	};
}

function formatIngredient(
	spec: RecipeListEntryWithRecipe["recipe"]["specs"][number],
	includeSpecs: boolean,
) {
	if (!includeSpecs) {
		return spec.ingredient.name;
	}

	const parts: string[] = [];

	if (spec.quantity != null) {
		parts.push(String(spec.quantity));
	}

	const unitStr = getFormattedUnit(spec.unit, spec.quantity);

	if (unitStr) {
		parts.push(unitStr);
	}

	parts.push(spec.ingredient.name);
	return parts.join(" ");
}

export function getExportFilename(
	list: Pick<RecipeList, "name"> & { createdAt?: Date | string | null; updatedAt?: Date | string | null },
	format: "txt" | "json",
): string {
	const sanitizedName = list.name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

	const timestamp = list.updatedAt ?? list.createdAt;
	const dateStr = timestamp
		? new Date(timestamp).toISOString().slice(0, 10)
		: new Date().toISOString().slice(0, 10);

	return `${sanitizedName || "recipe-list"}-${dateStr}.${format}`;
}

function sortEntries(
	entries: RecipeListEntryWithRecipe[],
): RecipeListEntryWithRecipe[] {
	return entries.toSorted((a, b) => {
		if (a.sortOrder == null && b.sortOrder == null) return 0;
		if (a.sortOrder == null) return 1;
		if (b.sortOrder == null) return -1;
		return a.sortOrder - b.sortOrder;
	});
}

const SEPARATOR = "-".repeat(20);

export function exportRecipeListAsText(
	list: ExportableRecipeList,
	options: ExportOptions = defaultExportOptions,
	currencyFormatter: CurrencyFormatter,
): string {
	const lines: string[] = [];

	if (options.includeListName && list.name) {
		lines.push(list.name);
	}

	if (options.includeListDescription && list.description) {
		lines.push(list.description);
	}

	if (lines.length > 0) {
		lines.push("");
		lines.push(SEPARATOR);
		lines.push("");
	}

	const sortedEntries = sortEntries(list.entries);

	const recipeBlocks: string[] = [];

	for (const entry of sortedEntries) {
		const { recipe, price } = entry;

		const recipeLines: string[] = [];

		if (options.includeName) {
			recipeLines.push(recipe.name ?? "Unnamed Recipe");
		}

		if (options.includePrice && price != null) {
			recipeLines.push(currencyFormatter.format(price));
		}

		if (options.includeDescription && recipe.description) {
			recipeLines.push("");
			recipeLines.push(recipe.description);
			recipeLines.push("");
		}

		if (options.includeIngredients && recipe.specs && recipe.specs.length > 0) {
			if (
				recipeLines.length > 0 &&
				recipeLines[recipeLines.length - 1] !== ""
			) {
				recipeLines.push("");
			}
			for (const spec of recipe.specs) {
				recipeLines.push(formatIngredient(spec, options.includeSpecs));
			}
		}

		const metadataLines: string[] = [];

		if (options.includeGlassware && recipe.glassware) {
			const label =
				GLASSWARE_TO_LABEL.get(recipe.glassware) ?? recipe.glassware;

			metadataLines.push(`Glass: ${label}`);
		}

		if (options.includeMethod && recipe.preparationMethod) {
			const label =
				METHOD_TO_LABEL.get(recipe.preparationMethod) ??
				recipe.preparationMethod;

			metadataLines.push(`Method: ${label}`);
		}

		if (options.includeGarnish && recipe.garnish) {
			metadataLines.push(`Garnish: ${recipe.garnish}`);
		}

		if (metadataLines.length > 0) {
			if (
				recipeLines.length > 0 &&
				recipeLines[recipeLines.length - 1] !== ""
			) {
				recipeLines.push("");
			}
			recipeLines.push(...metadataLines);
		}

		if (options.includeInstructions && recipe.instructions) {
			if (
				recipeLines.length > 0 &&
				recipeLines[recipeLines.length - 1] !== ""
			) {
				recipeLines.push("");
			}
			recipeLines.push(recipe.instructions);
		}

		recipeBlocks.push(recipeLines.join("\n"));
	}

	/**
	 * Join recipe blocks with separator
	 */
	lines.push(recipeBlocks.join(`\n\n${SEPARATOR}\n\n`));

	return lines.join("\n");
}

export function exportRecipeListAsJson(
	list: ExportableRecipeList,
	options: ExportOptions = defaultExportOptions,
) {
	const sortedEntries = sortEntries(list.entries);

	return {
		name: options.includeListName ? list.name : undefined,
		description: options.includeListDescription ? list.description : undefined,
		recipes: sortedEntries.map(({ recipe, price }) => ({
			name: options.includeName ? (recipe.name ?? "Unnamed Recipe") : undefined,
			description:
				options.includeDescription && recipe.description
					? recipe.description
					: undefined,
			price: options.includePrice && price != null ? price : undefined,
			ingredients:
				options.includeIngredients && recipe.specs && recipe.specs.length > 0
					? recipe.specs.map((spec) =>
							options.includeSpecs
								? {
										quantity: spec.quantity,
										unit: getFormattedUnit(spec.unit, spec.quantity) || null,
										name: spec.ingredient.name,
									}
								: spec.ingredient.name,
						)
					: undefined,
			glassware:
				options.includeGlassware && recipe.glassware
					? recipe.glassware
					: undefined,
			method:
				options.includeMethod && recipe.preparationMethod
					? recipe.preparationMethod
					: undefined,
			garnish:
				options.includeGarnish && recipe.garnish ? recipe.garnish : undefined,
			instructions:
				options.includeInstructions && recipe.instructions
					? recipe.instructions
					: undefined,
		})),
	};
}
