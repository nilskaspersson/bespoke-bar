import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { useFormatter } from "@/hooks/useFormatter";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function RecipeEntryProfitLabel({
	className,
	cost,
	price,
	isIncomplete,
	servings = 1,
	...props
}: {
	cost: number;
	price: number;
	isIncomplete?: boolean;
	servings?: number;
} & ComponentProps<typeof Text>) {
	const { currencyFormatter } = useFormatter();

	if (price == null) {
		return null;
	}

	const profit = (price - cost) * servings;

	return (
		<Text
			{...props}
			className={clsx(className, {
				[styles.negative]: Math.round(profit) <= 0,
			})}
		>
			{currencyFormatter.format(profit)}
			{isIncomplete ? "*" : null}
		</Text>
	);
}
