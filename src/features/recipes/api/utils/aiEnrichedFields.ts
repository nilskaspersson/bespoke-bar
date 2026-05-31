import { z } from "zod";
import { isEmpty } from "@/utils";

const recipeAiEnrichedFieldsSchema = z
	.array(z.enum(["style", "glassware", "ice", "preparationMethod"]))
	.nullish();

export type RecipeEnrichableField = NonNullable<
	z.infer<typeof recipeAiEnrichedFieldsSchema>
>[number];

/**
 * Recompute `ai_enriched_fields` after a user edit: a mark survives only while
 * the field stays empty. safeParse so a bad stored array can't block the write.
 */
export function clearTouchedAiMarks(
	current: unknown,
	submitted: Partial<Record<RecipeEnrichableField, unknown>>,
): RecipeEnrichableField[] | null {
	const parsed = recipeAiEnrichedFieldsSchema.safeParse(current);
	const marked = parsed.success ? (parsed.data ?? []) : [];
	const kept = marked.filter((field) => isEmpty(submitted[field]));
	return kept.length > 0 ? kept : null;
}
