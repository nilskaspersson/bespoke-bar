"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/ui/Button";

export function SubmitButton({
	children,
	disabled,
	...props
}: Omit<ComponentProps<typeof Button>, "type">) {
	const { pending } = useFormStatus();

	return (
		<Button
			{...props}
			type="submit"
			aria-disabled={props["aria-disabled"] || pending}
		>
			{children}
		</Button>
	);
}
