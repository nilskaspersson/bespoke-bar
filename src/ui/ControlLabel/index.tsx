import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

type Props = {
	className?: string;
	label: React.ReactNode;
	children: React.ReactNode;
	required?: boolean;
	htmlFor: string;
	inline?: boolean;
	id: string;
} & ComponentProps<"label">;

export function ControlLabel({
	className,
	label,
	children,
	required,
	htmlFor,
	id,
	inline,
	...props
}: Props) {
	return (
		<div
			className={clsx(styles.base, className, {
				[styles.inline]: inline,
			})}
		>
			{label ? (
				<Text
					{...props}
					id={id}
					as="label"
					size={2}
					weight={500}
					compact
					htmlFor={htmlFor}
					className={clsx(styles.label, {
						required,
					})}
				>
					<span className={styles.text}>{label}</span>
				</Text>
			) : null}

			{children}
		</div>
	);
}
