import type { UserInputSpec } from "@/db/schema/specs";
import { userInputToSpec } from "@/features/specs/utils/userInputToSpec";

export type DraftRecipe = {
	name: string | null;
	specs: UserInputSpec[];
};

const PATTERN_REPEATING_NEWLINES = /\n(?:\s*\n)+/;
const PATTERN_LIST_PREFIX = /^[-*]\s*/;

function removeListPrefix(line: string): string {
	return line.replace(PATTERN_LIST_PREFIX, "");
}

export function userInputToBulkRecipe(userInput: string): DraftRecipe[] {
	const textBlocks = userInput.trim().split(PATTERN_REPEATING_NEWLINES);

	const results: DraftRecipe[] = [];

	for (let i = 0; i < textBlocks.length; i++) {
		const rawLines = textBlocks[i].trim().split("\n");

		if (rawLines.length === 0) {
			continue;
		}

		let recipeName: string | undefined;
		const specs: UserInputSpec[] = [];

		/**
		 * Parse the first line of the block independently. If it looks like a spec, push
		 * it to specs. If not, consider it the name of the recipe.
		 */
		if (rawLines[0].length > 0) {
			const firstLineAsSpec = userInputToSpec(removeListPrefix(rawLines[0]));

			if (firstLineAsSpec) {
				if (
					firstLineAsSpec.quantity !== null ||
					firstLineAsSpec.unit !== null
				) {
					specs.push(firstLineAsSpec);
				} else {
					recipeName = rawLines[0].trim();
				}
			}
		}

		/**
		 * Parse the rest of the lines as specs, offset starting index by 1 since we
		 * already parsed the first line of the block.
		 */
		for (let j = 1; j < rawLines.length; j++) {
			const line = rawLines[j].trim();

			if (line.length === 0) {
				continue;
			}

			const spec = userInputToSpec(removeListPrefix(line));

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
