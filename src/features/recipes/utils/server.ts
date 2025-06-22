import { revalidatePath } from "next/cache";
import type { Recipe } from "@/db/schema/recipes";

export function revalidateRecipePaths(id: Recipe["id"]) {
	revalidatePath("/bar/recipes");
	revalidatePath(`/bar/recipes/${id}`);
}
