"use client";

import { clsx } from "clsx";
import { type ComponentProps, useId } from "react";
import { useFormStatus } from "react-dom";
import { ControlLabel } from "@/ui/ControlLabel";
import { Input } from "@/ui/Input";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function TextField({
	as,
	adornment,
	className,
	disabled,
	label,
	helperText,
	id,
	...inputProps
}: ComponentProps<typeof Input> & {
	as?: "input" | "textarea";
	adornment?: React.ReactNode;
	label: React.ReactNode;
	compact?: boolean;
	helperText?: React.ReactNode;
}) {
	const { pending } = useFormStatus();

	const labelId = useId();
	const inputId = useId();
	const helperTextId = useId();

	return (
		<ControlLabel
			className={className}
			htmlFor={id ?? inputId}
			id={labelId}
			label={label}
			required={inputProps.required}
			inline={inputProps.inline}
		>
			<div className={styles.contain}>
				{adornment ? (
					<label
						aria-hidden="true"
						htmlFor={id ?? inputId}
						className={styles.adornment}
					>
						{adornment}
					</label>
				) : null}

				<Input
					as={as}
					{...inputProps}
					aria-disabled={disabled || pending}
					id={id ?? inputId}
					aria-describedby={helperText ? helperTextId : undefined}
					readOnly={inputProps.readOnly || pending}
					className={clsx({
						[styles.hasAdornment]: Boolean(adornment),
					})}
				/>
			</div>

			{helperText ? (
				<Text as="div" size={1} id={helperTextId} className={styles.helperText}>
					{helperText}
				</Text>
			) : null}
		</ControlLabel>
	);
}
