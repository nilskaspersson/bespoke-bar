"use client";

import type { ComponentProps } from "react";
import { useFormatter } from "@/hooks/useFormatter";
import { TextField } from "@/ui/TextField";

export function SelectUnitCost({
	currency,
	...props
}: {
	currency: string;
} & ComponentProps<typeof TextField>) {
	const { currencyDisplayName } = useFormatter();

	return (
		<TextField
			{...props}
			helperText={`In ${currencyDisplayName.of(currency)} (${currency})`}
		/>
	);
}
