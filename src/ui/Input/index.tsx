import { clsx } from "clsx";
import { type ComponentProps, createElement } from "react";
import formControlStyles from "@/ui/FormControl/styles.module.css";
import styles from "./styles.module.css";

type BaseProps = {
	as?: "input" | "textarea";
	id?: string;
	readOnly?: boolean;
	compact?: boolean;
	pill?: boolean;
	fullWidth?: boolean;
	rounded?: boolean;
};

type InputProps = BaseProps & {
	as?: "input";
	type?: "text" | "search" | "number";
} & ComponentProps<"input">;

type TextareaProps = BaseProps & {
	as?: "textarea";
} & ComponentProps<"textarea">;

export function Input(props: InputProps): React.ReactNode;
export function Input(props: TextareaProps): React.ReactNode;
export function Input({
	as = "input",
	compact,
	pill,
	fullWidth,
	rounded,
	...props
}: InputProps | TextareaProps): React.ReactNode {
	const isTextArea = as === "textarea";

	return createElement(as, {
		type: isTextArea ? undefined : "text",
		...props,
		className: clsx(
			props.className,
			formControlStyles.reset,
			formControlStyles.control,
			{
				[styles.textarea]: isTextArea,
				[styles.pill]: pill,
				[formControlStyles.compact]: compact,
				[formControlStyles.fullWidth]: fullWidth,
				[formControlStyles.rounded]: rounded,
			},
		),
	});
}
