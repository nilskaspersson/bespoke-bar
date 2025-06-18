import { revalidatePath } from "next/cache";
import type { Recipe } from "@/db/schema/recipes";

export function revalidateRecipePaths(id: Recipe["id"]) {
	revalidatePath("/bar/recipes");
	revalidatePath(`/bar/recipes/${id}`);
}

const PATTERN_URL_FRIENDLY_SLUG = /^[a-zA-Z0-9_-]+$/;

export function isValidRecipeParams(
	id: string | undefined,
	slug?: string[],
): boolean {
	if (!id || !PATTERN_URL_FRIENDLY_SLUG.test(id)) {
		return false;
	}

	/**
	 * Slug is optional to enable human-readable URLs, but with Next.js, the only
	 * optional segment pattern is a catch-all.
	 */
	if (!slug || slug.length === 0) {
		return true;
	}

	return slug.every((segment) => PATTERN_URL_FRIENDLY_SLUG.test(segment));
}
