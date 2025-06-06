import { clsx } from "clsx";
import {
	createElement,
	type InputHTMLAttributes,
	type TextareaHTMLAttributes,
} from "react";
import formControlStyles from "@/ui/FormControl/styles.module.css";
import styles from "./styles.module.css";

type BaseProps = {
	as?: "input" | "textarea";
	id?: string;
	readOnly?: boolean;
	compact?: boolean;
	fullWidth?: boolean;
	rounded?: boolean;
};

type InputProps = BaseProps & {
	as?: "input";
} & InputHTMLAttributes<HTMLInputElement>;

type TextareaProps = BaseProps & {
	as?: "textarea";
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Input(props: InputProps): React.ReactNode;
export function Input(props: TextareaProps): React.ReactNode;
export function Input({
	as = "input",
	compact,
	fullWidth,
	rounded,
	...props
}: InputProps | TextareaProps): React.ReactNode {
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
