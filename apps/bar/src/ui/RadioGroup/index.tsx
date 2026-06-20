"use client";

import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Checkbox } from "@/ui/Checkbox";
import { Grid } from "@/ui/Grid";
import { Text } from "@/ui/Text";
import { getKey, type Keyed } from "@/utils/withKey";
import styles from "./styles.module.css";

export type RadioGroupOption = {
	label: string;
	value: string;
};

export function RadioGroup({
	className,
	legend,
	options,
	id,
	defaultValue,
	...inputProps
}: Omit<
	ComponentProps<typeof Checkbox>,
	"type" | "value" | "label" | "checked" | "defaultChecked"
> & {
	legend: React.ReactNode;
	name: string;
	options: Keyed<RadioGroupOption>[] | null | undefined;
}) {
	return (
		<fieldset className={clsx(className, styles.fieldset)} id={id}>
			<div>
				<Text
					size={2}
					as="legend"
					weight={600}
					compact
					className={clsx({ required: inputProps.required })}
				>
					{legend}
				</Text>
			</div>

			<Grid gap={2}>
				{options?.map((option) => (
					<Checkbox
						key={getKey(option)}
						type="radio"
						label={option.label}
						value={option.value}
						defaultChecked={option.value === defaultValue}
						{...inputProps}
					/>
				))}
			</Grid>
		</fieldset>
	);
}
