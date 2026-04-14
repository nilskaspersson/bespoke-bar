"use client";

import type { MouseEventHandler, Ref } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { OptionsList } from "@/ui/OptionsList";
import { formatAbv } from "./utils";

export function IngredientOption({
	ingredient,
	isHighlighted,
	onClick,
	onMouseEnter,
	ref,
}: {
	ingredient: Ingredient;
	isHighlighted: boolean;
	onClick: MouseEventHandler<HTMLLIElement>;
	onMouseEnter: MouseEventHandler<HTMLLIElement>;
	ref?: Ref<HTMLLIElement>;
}) {
	const category = ingredient.category
		? CATEGORY_TO_LABEL.get(ingredient.category)
		: null;
	const abv = formatAbv(ingredient.abv);
	const description = [category, abv].filter(Boolean).join(", ") || undefined;

	return (
		<OptionsList.Item
			ref={ref}
			isHighlighted={isHighlighted}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
		>
			<OptionsList.Label description={description}>
				{ingredient.name}
			</OptionsList.Label>
		</OptionsList.Item>
	);
}
