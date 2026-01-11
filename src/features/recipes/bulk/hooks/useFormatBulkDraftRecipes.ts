import { useMemo } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import type { BaseRecipe } from "@/db/schema/recipes";
import { isEmptyDraftRecipe } from "@/features/recipes/utils";
import { userInputToBulkRecipe } from "@/features/specs/utils/userInputToBulkRecipe";
import { type Keyed, withKey } from "@/utils/withKey";

export function useBulkDraftTextToBaseRecipes(
	inputValue: string,
	ingredients: Ingredient[],
): Keyed<BaseRecipe>[] {
	return useMemo(
		() =>
			userInputToBulkRecipe(inputValue, ingredients)
				.filter((recipe) => !isEmptyDraftRecipe(recipe))
				.map(withKey),
		[inputValue, ingredients],
	);
}
