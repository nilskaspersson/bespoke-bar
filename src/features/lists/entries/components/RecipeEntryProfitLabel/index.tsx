import { clsx } from "clsx";
import { type ElementType, use } from "react";
import { FormatterContext } from "@/hooks/useFormatter";
import { Text, type TextProps } from "@/ui/Text";
import styles from "./styles.module.css";

export function RecipeEntryProfitLabel<E extends ElementType = "span">({
	as,
	className,
	cost,
	price,
	isIncomplete,
	servings = 1,
	noWrap = true,
	numeric = true,
	...props
}: {
	cost: number;
	price: number;
	isIncomplete?: boolean;
	servings?: number;
} & TextProps<E>) {
	const { currencyFormatter } = use(FormatterContext);

	if (price == null) {
		return null;
	}

	const profit = (price - cost) * servings;

	return (
		<Text
			{...props}
			as={as ?? "span"}
			noWrap={noWrap}
			numeric={numeric}
			className={clsx(className, {
				[styles.negative]: Math.round(profit) <= 0,
			})}
		>
			{currencyFormatter.format(profit)}
			{isIncomplete ? "*" : null}
		</Text>
	);
}
