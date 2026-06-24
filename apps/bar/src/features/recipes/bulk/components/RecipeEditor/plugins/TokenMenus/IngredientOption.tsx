"use client";

import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { Menu } from "@bespoke/ui/Menu";
import { type ComponentProps, use } from "react";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";

export function IngredientOption({
	ingredient,
	...props
}: { ingredient: Ingredient } & ComponentProps<typeof Menu.Item>) {
	const { percentageFormatter } = use(FormatterContext);

	const category = ingredient.category
		? CATEGORY_TO_LABEL.get(ingredient.category)
		: null;
	const abv =
		ingredient.abv !== null ? percentageFormatter.format(ingredient.abv) : null;
	const description = [category, abv].filter(Boolean).join(", ") || undefined;

	return (
		<Menu.Item {...props}>
			<Menu.Label description={description}>{ingredient.name}</Menu.Label>
		</Menu.Item>
	);
}
