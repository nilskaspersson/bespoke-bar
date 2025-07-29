import { revalidatePath } from "next/cache";
import type { RecipeList } from "@/db/schema/recipeLists";

export function revalidateRecipeListPaths({
	id,
	shouldRevalidateBar = false,
}: {
	id: RecipeList["id"];
	shouldRevalidateBar?: boolean;
}) {
	revalidatePath("/bar/lists", "page");
	revalidatePath(`/bar/lists/${id}`, "layout");

	if (shouldRevalidateBar) {
		revalidatePath("/bar", "page");
	}
}
