"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

import { ControlLabel } from "@/ui/ControlLabel";
import { Input } from "@/ui/Input";

export function TextField({
	as,
	className,
	disabled,
	label,
	...inputProps
}: ComponentProps<typeof Input> & {
	as?: "input" | "textarea";
	label: React.ReactNode;
	compact?: boolean;
}) {
	const { pending } = useFormStatus();

	return (
		<ControlLabel
			className={className}
			id={inputProps.id}
			label={label}
			required={inputProps.required}
		>
			<Input
				as={as}
				{...inputProps}
				aria-disabled={disabled || pending}
				readOnly={pending}
			/>
		</ControlLabel>
	);
}
