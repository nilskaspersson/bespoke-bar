"use client";

import { clsx } from "clsx";
import { type ComponentProps, useCallback, useState } from "react";
import z from "zod";
import { Button } from "@/ui/Button";
import formControlStyles from "@/ui/FormControl/styles.module.css";
import { Icon } from "@/ui/Icon";
import { handleKey } from "@/utils/keyboard";
import styles from "./styles.module.css";

export function QuantityControl({
	className,
	defaultValue,
	compact,
	step = 0.5,
	min = 0.1,
	max = 1000000000,
	name,
}: Pick<ComponentProps<"input">, "className" | "defaultValue" | "name"> & {
	compact?: boolean;
	min?: number;
	max?: number;
	step?: number;
}) {
	const parseValue = useCallback(
		(v: unknown): number | null => {
			const parsedValue = z.coerce.number().min(min).max(max).safeParse(v);
			return parsedValue.success ? parsedValue.data : null;
		},
		[min, max],
	);

	const [value, setValue] = useState<string>(defaultValue?.toString() ?? "1");

	const handleDecrement = useCallback(() => {
		setValue((value) => {
			return parseValue(Number(value) - step)?.toString() ?? value;
		});
	}, [parseValue, step]);

	const handleIncrement = useCallback(() => {
		setValue((value) => {
			return parseValue(Number(value) + step)?.toString() ?? value;
		});
	}, [parseValue, step]);

	return (
		<div
			data-invalid={parseValue(value) === null}
			className={clsx(
				styles.base,
				formControlStyles.control,
				formControlStyles.rounded,
				className,
				{
					[formControlStyles.compact]: compact,
				},
			)}
		>
			<Button
				variant="ghost"
				size="small"
				color="light"
				icon
				onClick={handleDecrement}
			>
				<Icon name="minus" />
			</Button>

			<input
				type="text"
				inputMode="decimal"
				className={clsx(styles.input, formControlStyles.reset)}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onFocus={(e) => e.target.select()}
				name={name}
				min={min}
				max={max}
				onKeyDown={handleKey([
					["ArrowUp", handleIncrement],
					["ArrowDown", handleDecrement],
				])}
			/>

			<Button
				variant="ghost"
				size="small"
				color="light"
				icon
				onClick={handleIncrement}
			>
				<Icon name="plus" />
			</Button>
		</div>
	);
}
