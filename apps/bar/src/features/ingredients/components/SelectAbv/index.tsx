"use client";

import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { type ComponentProps, use } from "react";
import { FormatterContext } from "@/hooks/useFormatter";
import { TextField } from "@/ui/TextField";

export function SelectAbv({
	ingredient,
	...props
}: { ingredient: Partial<Ingredient> | undefined } & ComponentProps<
	typeof TextField
>) {
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
