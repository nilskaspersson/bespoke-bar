"use client";

import { type ComponentProps, useContext } from "react";
import { FormatterContext } from "@/hooks/useFormatter";
import { TextField } from "@/ui/TextField";

export function SelectUnitCost({
	currency,
	...props
}: {
	currency: string;
} & ComponentProps<typeof TextField>) {
	const { currencyDisplayName } = useContext(FormatterContext);

	return (
		<TextField
			{...props}
			helperText={`In ${currencyDisplayName.of(currency)} (${currency})`}
		/>
	);
}
