import { revalidatePath } from "next/cache";
import type { RecipeList } from "@/db/schema/recipeLists";

export function revalidateRecipeListPaths(id: RecipeList["id"]) {
	revalidatePath("/bar/lists", "page");
	revalidatePath(`/bar/lists/${id}`, "layout");
}
