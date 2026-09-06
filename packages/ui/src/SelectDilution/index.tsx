"use client";

import { type ChangeEvent, use, useId, useState } from "react";
import { ControlLabel } from "../ControlLabel";
import { FormatterContext } from "../hooks/useFormatter";
import { Text } from "../Text";
import styles from "./styles.module.css";

/**
 * Uncontrolled on purpose: the displayed percentage tracks the input locally,
 * and a caller that changes the target from elsewhere (picking a Preparation
 * Method) remounts it with a new `defaultValue` via `key` — which is how the
 * bar's Conform field already re-seeds itself.
 */
export function SelectDilution({
	name,
	id,
	required,
	defaultValue = 0,
	onChange,
	label,
	helperText = "Dilution as water gained.",
}: {
	name: string;
	id?: string;
	required?: boolean;
	defaultValue?: number;
	onChange?: (dilutionTarget: number) => void;
	label?: string;
	helperText?: React.ReactNode;
}) {
	const { percentageFormatter } = use(FormatterContext);
	const fallbackId = useId();
	const markersId = useId();
	const inputId = id ?? fallbackId;

	const [dilutionTarget, setDilutionTarget] = useState(defaultValue);

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		const next = event.target.valueAsNumber;
		setDilutionTarget(next);
		onChange?.(next);
	}

	return (
		<ControlLabel
			htmlFor={inputId}
			required={required}
			label={
				label ??
				`Target dilution: ${percentageFormatter.format(dilutionTarget)}`
			}
		>
			<input
				id={inputId}
				type="range"
				name={name}
				defaultValue={defaultValue}
				aria-describedby={helperText ? `${inputId}-helper` : undefined}
				min={0}
				max={1}
				step={0.01}
				className={styles.range}
				list={markersId}
				onChange={handleChange}
			/>

			<datalist id={markersId}>
				<option value="0" />
				<option value="0.25" />
				<option value="0.5" />
				<option value="0.75" />
				<option value="1" />
			</datalist>

			{helperText ? (
				<Text size={1} id={`${inputId}-helper`}>
					{helperText}
				</Text>
			) : null}
		</ControlLabel>
	);
}
