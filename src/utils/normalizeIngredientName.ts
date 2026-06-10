/**
 * Canonical form of an ingredient name — the single source of truth for ingredient
 * identity. The app computes it and persists it to `ingredients.normalized_name`.
 */
export function normalizeIngredientName(name: string): string {
	return name.trim().toLowerCase();
}
