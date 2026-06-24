import { Text, type TextProps } from "@bespoke/ui/Text";
import type { SystemColor } from "@bespoke/ui/utils/types";
import { clsx } from "clsx";
import styles from "./styles.module.css";

export function RecipesCountBadge({
	count,
	className,
	color = "regular",
	...props
}: { count: number; color?: SystemColor } & Omit<TextProps, "color">) {
	return (
		<Text
			as="span"
			heavy
			compact
			size={2}
			className={clsx(styles.count, className, styles[color])}
			{...props}
		>
			{count} {count === 1 ? "recipe" : "recipes"}
		</Text>
	);
}
