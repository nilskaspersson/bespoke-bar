"use client";

import type { ComponentProps } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { useFormatter } from "@/hooks/useFormatter";
import { TextField } from "@/ui/TextField";

export function SelectAbv({
	ingredient,
	...props
}: { ingredient: Ingredient | undefined } & ComponentProps<typeof TextField>) {
	const { percentageFormatter } = useFormatter();

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
