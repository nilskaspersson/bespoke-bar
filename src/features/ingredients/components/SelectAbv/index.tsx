"use client";

import { type ComponentProps, use } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { FormatterContext } from "@/hooks/useFormatter";
import { TextField } from "@/ui/TextField";

export function SelectAbv({
	ingredient,
	...props
}: { ingredient: Ingredient | undefined } & ComponentProps<typeof TextField>) {
	const { percentageFormatter } = use(FormatterContext);

	return (
		<TextField
			defaultValue={
				ingredient?.abv ? percentageFormatter.format(ingredient.abv) : undefined
			}
			helperText="Percentage value from 0-100%. Up to two decimal places."
			{...props}
		/>
	);
}
