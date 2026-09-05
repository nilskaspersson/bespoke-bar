import { formatLine } from "@bespoke/domain/ingredientLines/formatLine";
import {
	GLASSWARE_TO_LABEL,
	getRecipeName,
	METHOD_TO_LABEL,
} from "@bespoke/domain/recipes/labels";
import { getFormattedUnit } from "@bespoke/domain/units/getFormattedUnit";
import type { MenuEntryWithRecipe } from "@bespoke/schema/schema/menuEntries";
import type { Menu } from "@bespoke/schema/schema/menus";

export type ExportOptions = {
	includeMenuName: boolean;
	includeMenuDescription: boolean;
	includeName: boolean;
	includeDescription: boolean;
	includePrice: boolean;
	includeIngredients: boolean;
	includeMeasures: boolean;
	includeGlassware: boolean;
	includeMethod: boolean;
	includeGarnish: boolean;
	includeInstructions: boolean;
};

export type ExportableMenu = Pick<
	Menu,
	"name" | "description" | "createdAt" | "updatedAt"
> & {
	entries: MenuEntryWithRecipe[];
};

export type CurrencyFormatter = {
	format: (value: number) => string;
};

const defaultExportOptions: ExportOptions = {
	includeMenuName: false,
	includeMenuDescription: false,
	includeName: false,
	includeDescription: false,
	includePrice: false,
	includeIngredients: false,
	includeMeasures: false,
	includeGlassware: false,
	includeMethod: false,
	includeGarnish: false,
	includeInstructions: false,
};

/** @public */
export function parseExportOptions(params: URLSearchParams): ExportOptions {
	return {
		includeMenuName: params.get("includeMenuName") === "true",
		includeMenuDescription: params.get("includeMenuDescription") === "true",
		includeName: params.get("includeName") === "true",
		includeDescription: params.get("includeDescription") === "true",
		includePrice: params.get("includePrice") === "true",
		includeIngredients: params.get("includeIngredients") === "true",
		includeMeasures: params.get("includeMeasures") === "true",
		includeGlassware: params.get("includeGlassware") === "true",
		includeMethod: params.get("includeMethod") === "true",
		includeGarnish: params.get("includeGarnish") === "true",
		includeInstructions: params.get("includeInstructions") === "true",
	};
}

function formatIngredient(
	line: MenuEntryWithRecipe["recipe"]["lines"][number],
	includeMeasures: boolean,
) {
	if (!includeMeasures) {
		return line.ingredient.name;
	}

	return formatLine({
		quantity: line.quantity,
		unit: line.unit,
		name: line.ingredient.name,
	});
}

export function getExportFilename(
	menu: Pick<Menu, "name"> & {
		createdAt?: string | null;
		updatedAt?: string | null;
	},
	format: "txt" | "json",
): string {
	const sanitizedName = menu.name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

	const timestamp = menu.updatedAt ?? menu.createdAt;
	const dateStr = timestamp
		? timestamp.slice(0, 10)
		: new Date().toISOString().slice(0, 10);

	return `${sanitizedName || "recipe-menu"}-${dateStr}.${format}`;
}

function sortEntries(entries: MenuEntryWithRecipe[]): MenuEntryWithRecipe[] {
	return entries.toSorted((a, b) => {
		if (a.sortOrder == null && b.sortOrder == null) return 0;
		if (a.sortOrder == null) return 1;
		if (b.sortOrder == null) return -1;
		return a.sortOrder - b.sortOrder;
	});
}

const SEPARATOR = "-".repeat(20);

export function exportMenuAsText(
	menu: ExportableMenu,
	options: ExportOptions = defaultExportOptions,
	currencyFormatter: CurrencyFormatter,
): string {
	const lines: string[] = [];

	if (options.includeMenuName && menu.name) {
		lines.push(menu.name);
	}

	if (options.includeMenuDescription && menu.description) {
		lines.push(menu.description);
	}

	if (lines.length > 0) {
		lines.push("");
		lines.push(SEPARATOR);
		lines.push("");
	}

	const sortedEntries = sortEntries(menu.entries);

	const recipeBlocks: string[] = [];

	for (const entry of sortedEntries) {
		const { recipe, price } = entry;

		const recipeLines: string[] = [];

		if (options.includeName) {
			recipeLines.push(getRecipeName(recipe));
		}

		if (options.includePrice && price != null) {
			recipeLines.push(currencyFormatter.format(price));
		}

		if (options.includeDescription && recipe.description) {
			recipeLines.push("");
			recipeLines.push(recipe.description);
			recipeLines.push("");
		}

		if (options.includeIngredients && recipe.lines && recipe.lines.length > 0) {
			if (
				recipeLines.length > 0 &&
				recipeLines[recipeLines.length - 1] !== ""
			) {
				recipeLines.push("");
			}
			for (const line of recipe.lines) {
				recipeLines.push(formatIngredient(line, options.includeMeasures));
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

export function exportMenuAsJson(
	menu: ExportableMenu,
	options: ExportOptions = defaultExportOptions,
) {
	const sortedEntries = sortEntries(menu.entries);

	return {
		name: options.includeMenuName ? menu.name : undefined,
		description: options.includeMenuDescription ? menu.description : undefined,
		recipes: sortedEntries.map(({ recipe, price }) => ({
			name: options.includeName ? getRecipeName(recipe) : undefined,
			description:
				options.includeDescription && recipe.description
					? recipe.description
					: undefined,
			price: options.includePrice && price != null ? price : undefined,
			ingredients:
				options.includeIngredients && recipe.lines && recipe.lines.length > 0
					? recipe.lines.map((line) =>
							options.includeMeasures
								? {
										quantity: line.quantity,
										unit: getFormattedUnit(line.unit, line.quantity) || null,
										name: line.ingredient.name,
									}
								: line.ingredient.name,
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
