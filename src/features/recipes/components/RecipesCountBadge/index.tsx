import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Text } from "@/ui/Text";
import type { SystemColor } from "@/utils/types";
import styles from "./styles.module.css";

export function RecipesCountBadge({
	count,
	className,
	color = "regular",
	...props
}: { count: number; color?: SystemColor } & Omit<
	ComponentProps<typeof Text>,
	"color"
>) {
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
