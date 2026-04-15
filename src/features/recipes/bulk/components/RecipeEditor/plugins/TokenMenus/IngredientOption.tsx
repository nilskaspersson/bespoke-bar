"use client";

import { type ComponentProps, use } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { FormatterContext } from "@/hooks/useFormatter";
import { OptionsList } from "@/ui/OptionsList";

export function IngredientOption({
	ingredient,
	...props
}: { ingredient: Ingredient } & ComponentProps<typeof OptionsList.Item>) {
	const { percentageFormatter } = use(FormatterContext);

	const category = ingredient.category
		? CATEGORY_TO_LABEL.get(ingredient.category)
		: null;
	const abv =
		ingredient.abv !== null ? percentageFormatter.format(ingredient.abv) : null;
	const description = [category, abv].filter(Boolean).join(", ") || undefined;

	return (
		<OptionsList.Item {...props}>
			<OptionsList.Label description={description}>
				{ingredient.name}
			</OptionsList.Label>
		</OptionsList.Item>
	);
}
