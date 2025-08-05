import { revalidatePath } from "next/cache";
import type { Ingredient } from "@/db/schema/ingredients";

export function revalidateIngredientPaths(id: Ingredient["id"]) {
	revalidatePath("/bar/ingredients", "page");
	revalidatePath(`/bar/ingredients/${id}`, "layout");
}

export function getIngredientsCacheTag(orgId: string): string {
	return `org:${orgId}:ingredients`;
}
