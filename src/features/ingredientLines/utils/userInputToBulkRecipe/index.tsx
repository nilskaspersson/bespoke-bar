import type { Ingredient } from "@/db/schema/ingredients";
import type { BaseRecipe } from "@/db/schema/recipes";
import { userInputToLine } from "@/features/ingredientLines/utils/userInputToLine";
import { buildIngredientIndex } from "@/features/ingredients/utils/buildIngredientIndex";
import { withKey } from "@/utils/withKey";

const PATTERN_REPEATING_NEWLINES = /\n(?:\s*\n)+/;
const PATTERN_LIST_PREFIX = /^[-*]\s*/;

function removeListPrefix(line: string): string {
	return line.replace(PATTERN_LIST_PREFIX, "");
}

export function userInputToBulkRecipe(
	userInput: string,
	ingredients: Ingredient[],
): BaseRecipe[] {
	const textBlocks = userInput.trim().split(PATTERN_REPEATING_NEWLINES);
	const ingredientIndex = buildIngredientIndex(ingredients);

	const results: BaseRecipe[] = [];

	for (let i = 0; i < textBlocks.length; i++) {
		const textLines = textBlocks[i].trim().split("\n");

		if (textLines.length === 0) {
			continue;
		}

		let recipeName: string | undefined;
		const lines: BaseRecipe["lines"] = [];

		/**
		 * Parse the first text line independently. If it looks like an ingredient
		 * line, push it; otherwise treat it as the recipe name.
		 */
		if (textLines[0].length > 0) {
			const parsedFirstLine = userInputToLine(
				removeListPrefix(textLines[0]),
				ingredients,
				ingredientIndex,
			);

			/**
			 * Check quantity only, unit can be ambiguous if a name ends with a unit
			 */
			if (parsedFirstLine && parsedFirstLine.quantity !== null) {
				lines.push(withKey(parsedFirstLine));
			} else {
				recipeName = textLines[0].trim();
			}
		}

		/**
		 * Parse the remaining text lines into ingredient lines, offset starting index
		 * by 1 since we already parsed the first line of the block.
		 */
		for (let j = 1; j < textLines.length; j++) {
			const line = userInputToLine(
				removeListPrefix(textLines[j]),
				ingredients,
				ingredientIndex,
			);

			if (line) {
				lines.push(withKey(line));
			}
		}

		results.push({
			name: recipeName ?? null,
			lines,
		});
	}

	return results;
}
