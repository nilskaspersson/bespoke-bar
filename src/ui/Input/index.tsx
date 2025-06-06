import { clsx } from "clsx";
import { createElement, type InputHTMLAttributes } from "react";
import formControlStyles from "@/ui/FormControl/styles.module.css";
import styles from "./styles.module.css";

export function Input({
	as = "input",
	compact,
	fullWidth,
	rounded,
	...props
}: InputHTMLAttributes<HTMLInputElement> & {
	as?: "input" | "textarea";
	id?: string;
	readOnly?: boolean;
	compact?: boolean;
	fullWidth?: boolean;
	rounded?: boolean;
}) {
	const isTextArea = as === "textarea";

	return createElement(as, {
		type: isTextArea ? undefined : "text",
		...props,
		className: clsx(props.className, formControlStyles.control, {
			[styles.textarea]: isTextArea,
			[formControlStyles.compact]: compact,
			[formControlStyles.fullWidth]: fullWidth,
			[formControlStyles.rounded]: rounded,
		}),
	});
}
