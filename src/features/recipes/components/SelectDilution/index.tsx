"use client";

import { useField } from "@conform-to/react";
import { useContext, useId } from "react";
import { FormatterContext } from "@/hooks/useFormatter";
import { ControlLabel } from "@/ui/ControlLabel";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function SelectDilution({ name }: { name: string }) {
	const { percentageFormatter } = useContext(FormatterContext);
	const [field] = useField<string>(name);
	const markersId = useId();

	const displayValue = field.value || field.initialValue;

	return (
		<ControlLabel
			htmlFor={field.id}
			id={field.id}
			required={field.required}
			label={
				displayValue != null
					? `Dilution: ${percentageFormatter.format(
							Number(displayValue),
						)} of final volume`
					: "Dilution of final volume"
			}
		>
			<input
				type="range"
				name="dilutionTarget"
				defaultValue={field.value}
				aria-describedby={`${field.id}-helper`}
				min={0}
				max={1}
				step={0.01}
				className={styles.range}
				list={markersId}
			/>

			<datalist id={markersId}>
				<option value="0" />
				<option value="0.25" />
				<option value="0.5" />
				<option value="0.75" />
				<option value="1" />
			</datalist>

			<Text size={1} id={`${field.id}-helper`}>
				Used to calculate the volume of the recipe.
			</Text>
		</ControlLabel>
	);
}
