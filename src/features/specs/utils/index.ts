import type { DraftSpec } from "@/db/schema/specs";

export function specIsDraft<T extends DraftSpec>(spec: T) {
	return spec.ingredientId == null;
}
