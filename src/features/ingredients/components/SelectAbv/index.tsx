"use client";

import { type ComponentProps, useContext } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { FormatterContext } from "@/hooks/useFormatter";
import { TextField } from "@/ui/TextField";

export function SelectAbv({
	ingredient,
	...props
}: { ingredient: Ingredient | undefined } & ComponentProps<typeof TextField>) {
	const { percentageFormatter } = useContext(FormatterContext);

	return (
		<TextField
			{...props}
			defaultValue={
				ingredient?.abv ? percentageFormatter.format(ingredient.abv) : undefined
			}
		/>
	);
}
