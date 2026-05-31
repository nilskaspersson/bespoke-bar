import { z } from "zod";
import { clearTouchedAiMarks as clearMarks } from "@/utils/aiEnrichedFields";

const recipeAiEnrichedFieldsSchema = z
	.array(z.enum(["style", "glassware", "ice", "preparationMethod"]))
	.nullish();

export type RecipeEnrichableField = NonNullable<
	z.infer<typeof recipeAiEnrichedFieldsSchema>
>[number];

type RecipeFieldValues = Partial<Record<RecipeEnrichableField, unknown>>;

/**
 * Recipe-typed adapter over the shared {@link clearMarks}: parses the stored mark
 * array (safeParse so a bad value can't block the write), then keeps only marks
 * whose stored value the user left unchanged.
 */
export function clearTouchedAiMarks(
	currentMarks: unknown,
	stored: RecipeFieldValues,
	submitted: RecipeFieldValues,
): RecipeEnrichableField[] | null {
	const parsed = recipeAiEnrichedFieldsSchema.safeParse(currentMarks);
	const marked = parsed.success ? (parsed.data ?? []) : [];
	return clearMarks(marked, stored, submitted);
}
