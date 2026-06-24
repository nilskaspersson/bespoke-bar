"use client";

import { clsx } from "clsx";
import { type ComponentProps, useId } from "react";
import { useFormStatus } from "react-dom";
import { ControlLabel } from "../ControlLabel";
import { Grid } from "../Grid";
import { Input, TextArea } from "../Input";
import { Skeleton } from "../Skeleton";
import { Text } from "../Text";
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
			<div
				className={clsx(styles.contain, {
					[styles.fullWidth]: props.fullWidth,
				})}
			>
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

export function TextFieldSkeleton() {
	return (
		<Grid gap={2}>
			<Skeleton variant="text" height="17px" width="60px" />
			<Skeleton variant="input" />
			<Skeleton variant="text" height="17px" width="270px" />
		</Grid>
	);
}
