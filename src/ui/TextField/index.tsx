"use client";

import { clsx } from "clsx";
import { type ComponentProps, useId } from "react";
import { useFormStatus } from "react-dom";
import { ControlLabel } from "@/ui/ControlLabel";
import { Input, TextArea } from "@/ui/Input";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function TextField({
	adornment,
	className,
	disabled,
	label,
	helperText,
	id,
	...props
}: ComponentProps<typeof Input> &
	ComponentProps<typeof TextArea> & {
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

	const inputProps = {
		"aria-disabled": disabled || pending,
		"aria-describedby": helperText ? helperTextId : undefined,
		...props,
		id: id ?? inputId,
		readOnly: props.readOnly || pending,
		className: clsx({
			[styles.hasAdornment]: Boolean(adornment),
		}),
	} as const;

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

				{inputProps.as === "textarea" ? (
					<TextArea {...(inputProps as ComponentProps<typeof TextArea>)} />
				) : (
					<Input {...inputProps} />
				)}
			</div>

			{helperText ? (
				<Text as="div" size={1} id={helperTextId} className={styles.helperText}>
					{helperText}
				</Text>
			) : null}
		</ControlLabel>
	);
}
