"use client";

import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { TextField } from "@bespoke/ui/TextField";
import type { ComponentProps } from "react";
import { use } from "react";

export function SelectUnitCost(props: ComponentProps<typeof TextField>) {
	const { currencyDisplayName, options } = use(FormatterContext);

	return (
		<TextField
			{...props}
			helperText={`${currencyDisplayName.of(options.currency)} (${options.currency})`}
		/>
	);
}
