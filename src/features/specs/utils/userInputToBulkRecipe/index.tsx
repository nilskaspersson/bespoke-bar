import type { DraftRecipe } from "@/db/schema/recipes";
import { userInputToSpec } from "@/features/specs/utils/userInputToSpec";
import { withID } from "@/utils/withId";

const PATTERN_REPEATING_NEWLINES = /\n(?:\s*\n)+/;
const PATTERN_LIST_PREFIX = /^[-*]\s*/;

function removeListPrefix(line: string): string {
	return line.replace(PATTERN_LIST_PREFIX, "");
}

export function userInputToBulkRecipe(userInput: string): DraftRecipe[] {
	const textBlocks = userInput.trim().split(PATTERN_REPEATING_NEWLINES);

	const results: DraftRecipe[] = [];

	for (let i = 0; i < textBlocks.length; i++) {
		const lines = textBlocks[i].trim().split("\n");

		if (lines.length === 0) {
			continue;
		}

		let recipeName: string | undefined;
		const specs: DraftRecipe["specs"] = [];

		/**
		 * Parse the first line of the block independently. If it looks like a spec, push
		 * it to specs. If not, consider it the name of the recipe.
		 */
		if (lines[0].length > 0) {
			const firstLineAsSpec = userInputToSpec(removeListPrefix(lines[0]));

			/**
			 * Check quantity only, unit can be ambiguous if a name ends with a unit
			 */
			if (firstLineAsSpec && firstLineAsSpec.quantity !== null) {
				specs.push(withID(firstLineAsSpec));
			} else {
				recipeName = lines[0].trim();
			}
		}

		/**
		 * Parse the rest of the lines as specs, offset starting index by 1 since we
		 * already parsed the first line of the block.
		 */
		for (let j = 1; j < lines.length; j++) {
			const spec = userInputToSpec(removeListPrefix(lines[j]));

			if (spec) {
				specs.push(withID(spec));
			}
		}

		results.push({
			name: recipeName ?? null,
			specs,
		});
	}

	return results;
}
