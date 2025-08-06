"use client";

import type { ComponentProps } from "react";
import { useFormatter } from "@/hooks/useFormatter";
import { TextField } from "@/ui/TextField";

export function SelectUnitCost(props: ComponentProps<typeof TextField>) {
	const { currencyDisplayName, options } = useFormatter();

	return (
		<TextField
			{...props}
			helperText={`${currencyDisplayName.of(options.currency)} (${options.currency})`}
		/>
	);
}
