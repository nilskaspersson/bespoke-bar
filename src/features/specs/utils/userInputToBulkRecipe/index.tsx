import type { UserInputSpec } from "@/db/schema/specs";
import { userInputToSpec } from "@/features/specs/utils/userInputToSpec";

export type DraftRecipe = {
	name: string | null;
	specs: UserInputSpec[];
};

const PATTERN_REPEATING_NEWLINES = /\n(?:\s*\n)+/;

export function userInputToBulkRecipe(userInput: string): DraftRecipe[] {
	const recipeBlocks = userInput.trim().split(PATTERN_REPEATING_NEWLINES);

	const results: DraftRecipe[] = [];

	for (let i = 0; i < recipeBlocks.length; i++) {
		const block = recipeBlocks[i].trim();

		if (block.length === 0) {
			continue;
		}

		const rawLines = block.split("\n");

		if (rawLines.length === 0) {
			continue;
		}

		let recipeName: string | undefined;
		let startIndex = 0;

		/**
		 * Consider the first line as a recipe name rather than sole ingredient name if
		 * doesn't have a quantity or unit
		 */
		const firstLine = rawLines[0].trim();

		if (firstLine.length > 0) {
			const firstLineAsSpec = userInputToSpec(rawLines[0]);

			if (
				firstLineAsSpec?.quantity === null &&
				firstLineAsSpec?.unit === null
			) {
				recipeName = rawLines[0].trim();
				startIndex = 1;
			}
		}

		/**
		 * Parse the rest of the lines as specs, skipping the first line if it's a recipe
		 * name.
		 */
		const specs: UserInputSpec[] = [];

		for (let j = startIndex; j < rawLines.length; j++) {
			const line = rawLines[j].trim();

			if (line.length === 0) {
				continue;
			}

			const spec = userInputToSpec(line);

			if (spec) {
				specs.push(spec);
			}
		}

		if (specs.length > 0) {
			results.push({
				name: recipeName ?? null,
				specs,
			});
		}
	}

	return results;
}
