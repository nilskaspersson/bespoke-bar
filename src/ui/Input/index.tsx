import { clsx } from "clsx";
import { type ComponentProps, createElement } from "react";
import formControlStyles from "@/ui/FormControl/styles.module.css";
import styles from "./styles.module.css";

type BaseProps = {
	className?: string;
	id?: string;
	readOnly?: boolean;
	compact?: boolean;
	large?: boolean;
	inline?: boolean;
	pill?: boolean;
	fullWidth?: boolean;
	rounded?: boolean;
	"aria-invalid"?: boolean;
};

export type InputProps = BaseProps & ComponentProps<"input">;
export type TextareaProps = BaseProps & ComponentProps<"textarea">;

export function Input({
	className,
	compact,
	fullWidth,
	inline,
	large,
	pill,
	rounded,
	...props
}: InputProps): React.ReactNode {
	return createElement("input", {
		type: "text",
		...props,
		className: clsx(
			className,
			formControlStyles.reset,
			formControlStyles.control,
			{
				[styles.pill]: pill,
				[formControlStyles.compact]: compact,
				[formControlStyles.fullWidth]: fullWidth,
				[formControlStyles.rounded]: rounded,
				[formControlStyles.inline]: inline,
				[formControlStyles.large]: large,
			},
		),
	});
}

export function TextArea({
	className,
	compact,
	fullWidth,
	inline,
	large,
	pill,
	rounded,
	...props
}: TextareaProps) {
	return createElement("textarea", {
		...props,
		className: clsx(
			className,
			formControlStyles.reset,
			formControlStyles.control,
			styles.textarea,
			{
				[styles.pill]: pill,
				[formControlStyles.compact]: compact,
				[formControlStyles.fullWidth]: fullWidth,
				[formControlStyles.rounded]: rounded,
				[formControlStyles.inline]: inline,
				[formControlStyles.large]: large,
			},
		),
	});
}
