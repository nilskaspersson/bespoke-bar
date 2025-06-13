"use client";

import { type ComponentProps, useId } from "react";
import { useFormStatus } from "react-dom";

import { ControlLabel } from "@/ui/ControlLabel";
import { Input } from "@/ui/Input";
import { Text } from "@/ui/Text";

export function TextField({
	as,
	className,
	disabled,
	label,
	helperText,
	...inputProps
}: Omit<ComponentProps<typeof Input>, "id"> & {
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
			htmlFor={inputId}
			id={labelId}
			label={label}
			required={inputProps.required}
		>
			<Input
				as={as}
				{...inputProps}
				aria-disabled={disabled || pending}
				id={inputId}
				aria-describedby={helperText ? helperTextId : undefined}
				readOnly={pending}
			/>

			{helperText ? (
				<Text size={1} id={helperTextId}>
					{helperText}
				</Text>
			) : null}
		</ControlLabel>
	);
}
