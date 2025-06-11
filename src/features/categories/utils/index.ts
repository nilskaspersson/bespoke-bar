import type { SystemCategory } from "@/db/schema/categories";
import { CATEGORY_DEFAULT_ABV } from "@/features/categories/constants";

export function getCategoryDefaultAbv(category: SystemCategory): number | null {
	return CATEGORY_DEFAULT_ABV.get(category) ?? null;
}

export function isAlcoholicCategory(category: SystemCategory): boolean {
	return CATEGORY_DEFAULT_ABV.has(category);
}
