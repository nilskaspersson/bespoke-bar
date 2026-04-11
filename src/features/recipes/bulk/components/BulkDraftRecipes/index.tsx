import type { ReactNode } from "react";
import type { RecipeFormData } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import type { Recipe } from "@/db/schema/recipes";
import { BulkDraftRecipesForm } from "@/features/recipes/bulk/components/BulkDraftRecipesForm";

export function BulkDraftRecipes({
	ingredients,
	createRecipes,
	info,
}: {
	ingredients: Ingredient[];
	createRecipes: (recipes: RecipeFormData[]) => Promise<Recipe[]>;
	info?: ReactNode;
}) {
	return (
		<BulkDraftRecipesForm
			ingredients={ingredients}
			createRecipes={createRecipes}
			info={info}
		/>
	);
}
