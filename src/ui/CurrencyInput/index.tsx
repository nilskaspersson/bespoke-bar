"use client";

import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { use, useMemo } from "react";
import { FormatterContext } from "@/hooks/useFormatter";
import { TextField } from "@/ui/TextField";
import styles from "./styles.module.css";

export function CurrencyInput(props: ComponentProps<typeof TextField>) {
	const {
		currencyDisplayName,
		currencyFormatter,
		options: { currency },
	} = use(FormatterContext);

	const symbol = useMemo(
		() =>
			currencyFormatter
				.formatToParts(0)
				.find((part) => part.type === "currency")?.value,
		[currencyFormatter],
	);

	return (
		<TextField
			type="number"
			min={0}
			adornment={
				<span
					className={clsx(styles.adornment, {
						[styles.compact]: props.compact,
					})}
				>
					{symbol}
				</span>
			}
			helperText={
				<span className={styles.helperText}>
					{currencyDisplayName.of(currency)} ({currency})
				</span>
			}
			{...props}
		/>
	);
}
