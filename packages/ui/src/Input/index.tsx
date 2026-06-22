import { clsx } from "clsx";
import { type ComponentProps, createElement, type ReactNode } from "react";
import formControlStyles from "../FormControl/styles.module.css";
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

type AdornmentProps = {
	startAdornment?: ReactNode;
	endAdornment?: ReactNode;
};

export type InputProps = BaseProps & AdornmentProps & ComponentProps<"input">;
export type TextareaProps = BaseProps & ComponentProps<"textarea">;

export function Input({
	className,
	compact,
	fullWidth,
	inline,
	large,
	pill,
	rounded,
	startAdornment,
	endAdornment,
	...props
}: InputProps): React.ReactNode {
	const input = createElement("input", {
		type: "text",
		...props,
		className: clsx(
			className,
			formControlStyles.reset,
			formControlStyles.control,
			{
				[styles.pill]: pill,
				[styles.hasStartAdornment]: Boolean(startAdornment),
				[styles.hasEndAdornment]: Boolean(endAdornment),
				[formControlStyles.compact]: compact,
				[formControlStyles.fullWidth]: fullWidth,
				[formControlStyles.rounded]: rounded,
				[formControlStyles.inline]: inline,
				[formControlStyles.large]: large,
			},
		),
	});

	if (!startAdornment && !endAdornment) {
		return input;
	}

	return (
		<div
			className={clsx(styles.adornedWrapper, {
				[styles.fitContent]: !fullWidth,
			})}
		>
			{startAdornment ? (
				<span className={clsx(styles.adornment, styles.start)}>
					{startAdornment}
				</span>
			) : null}

			{input}

			{endAdornment ? (
				<span className={clsx(styles.adornment, styles.end)}>
					{endAdornment}
				</span>
			) : null}
		</div>
	);
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
