"use client";

import { type ComponentProps, useId } from "react";
import { useFormStatus } from "react-dom";

import { ControlLabel } from "@/ui/ControlLabel";
import { Input } from "@/ui/Input";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function TextField({
	as,
	className,
	disabled,
	label,
	helperText,
	id,
	...inputProps
}: ComponentProps<typeof Input> & {
	as?: "input" | "textarea";
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
				<Input
					as={as}
					{...inputProps}
					aria-disabled={disabled || pending}
					id={id ?? inputId}
					aria-describedby={helperText ? helperTextId : undefined}
					readOnly={inputProps.readOnly || pending}
				/>

				{helperText ? (
					<Text
						as="div"
						size={1}
						id={helperTextId}
						className={styles.helperText}
					>
						{helperText}
					</Text>
				) : null}
			</div>
		</ControlLabel>
	);
}
