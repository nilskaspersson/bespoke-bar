import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { generateButtonClassName } from "../Button";
import styles from "./styles.module.css";

export function FileInput({
	className,
	children,
	buttonProps,
	...props
}: Omit<ComponentProps<"input">, "type"> & {
	children: ReactNode;
	buttonProps?: Parameters<typeof generateButtonClassName>[0];
}) {
	return (
		<label
			aria-disabled={props.disabled}
			className={clsx(
				styles.label,
				className,
				generateButtonClassName(buttonProps ?? {}),
			)}
		>
			<input type="file" {...props} className={styles.file} />
			{children}
		</label>
	);
}
