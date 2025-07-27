"use client";

import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { useMemo } from "react";
import { useFormatter } from "@/hooks/useFormatter";
import { TextField } from "@/ui/TextField";
import styles from "./styles.module.css";

export function CurrencyInput(props: ComponentProps<typeof TextField>) {
	const {
		currencyDisplayName,
		currencyFormatter,
		options: { currency },
	} = useFormatter();

	const symbol = useMemo(
		() =>
			currencyFormatter
				.formatToParts(0)
				.find((part) => part.type === "currency")?.value,
		[currencyFormatter],
	);

	return (
		<TextField
			adornment={
				<span
					className={clsx(styles.adornment, {
						[styles.compact]: props.compact,
					})}
				>
					{symbol}
				</span>
			}
			helperText={`In ${currencyDisplayName.of(currency)} (${currency})`}
			{...props}
		/>
	);
}
