import type { ComponentProps } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { OptionsList } from "@/ui/OptionsList";
import { formatAbv } from "./utils";

export function IngredientOption({
	ingredient,
	...props
}: { ingredient: Ingredient } & ComponentProps<typeof OptionsList.Item>) {
	const category = ingredient.category
		? CATEGORY_TO_LABEL.get(ingredient.category)
		: null;
	const abv = formatAbv(ingredient.abv);
	const description = [category, abv].filter(Boolean).join(", ") || undefined;

	return (
		<OptionsList.Item {...props}>
			<OptionsList.Label description={description}>
				{ingredient.name}
			</OptionsList.Label>
		</OptionsList.Item>
	);
}
