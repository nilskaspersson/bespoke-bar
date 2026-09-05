import { userInputToBulkRecipe } from "@bespoke/domain/ingredientLines/userInputToBulkRecipe";
import { isEmptyDraftRecipe } from "@bespoke/domain/recipes/predicates";
import { withKey } from "@bespoke/domain/utils/withKey";
import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import type { Keyed } from "@bespoke/schema/types";
import { useMemo } from "react";

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
