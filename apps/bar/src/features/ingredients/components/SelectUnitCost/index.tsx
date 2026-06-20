"use client";

import type { ComponentProps } from "react";
import { use } from "react";
import { FormatterContext } from "@/hooks/useFormatter";
import { TextField } from "@/ui/TextField";

export function SelectUnitCost(props: ComponentProps<typeof TextField>) {
	const { currencyDisplayName, options } = use(FormatterContext);

	return (
		<TextField
			{...props}
			helperText={`${currencyDisplayName.of(options.currency)} (${options.currency})`}
		/>
	);
}
