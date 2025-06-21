import { revalidatePath } from "next/cache";
import type { Ingredient } from "@/db/schema/ingredients";

export function revalidateIngredientPaths(id: Ingredient["id"]) {
	revalidatePath("/bar/ingredients");
	revalidatePath(`/bar/ingredients/${id}`);
}
