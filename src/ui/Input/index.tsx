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

const propsToClassName = (props: BaseProps) =>
	clsx(props.className, formControlStyles.reset, formControlStyles.control, {
		[styles.pill]: props.pill,
		[formControlStyles.compact]: props.compact,
		[formControlStyles.fullWidth]: props.fullWidth,
		[formControlStyles.rounded]: props.rounded,
		[formControlStyles.inline]: props.inline,
		[formControlStyles.large]: props.large,
	});

export function Input(props: InputProps): React.ReactNode {
	return createElement("input", {
		type: "text",
		...props,
		className: propsToClassName(props),
	});
}

export function TextArea(props: TextareaProps) {
	return createElement("textarea", {
		...props,
		className: clsx(propsToClassName(props), styles.textarea),
	});
}
