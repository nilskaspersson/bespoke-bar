"use client";

import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { TextField } from "@bespoke/ui/TextField";
import { type ComponentProps, use } from "react";

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
