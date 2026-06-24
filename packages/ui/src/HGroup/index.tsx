import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Text } from "../Text";
import styles from "./styles.module.css";

export function HGroup({
	children,
	overline,
	tagline,
	floatingOverline,
	className,
	...props
}: ComponentProps<"hgroup"> & {
	overline?: ReactNode;
	tagline?: ReactNode;
	floatingOverline?: boolean;
}) {
	return (
		<hgroup {...props} className={clsx(className, styles.hgroup)}>
			{typeof overline === "string" ? (
				<Text
					as="p"
					size={1}
					light
					className={floatingOverline ? styles.overline : undefined}
				>
					{overline}
				</Text>
			) : (
				overline
			)}

			{children}

			{typeof tagline === "string" ? (
				<Text as="p" size={2} light>
					{tagline}
				</Text>
			) : (
				tagline
			)}
		</hgroup>
	);
}
