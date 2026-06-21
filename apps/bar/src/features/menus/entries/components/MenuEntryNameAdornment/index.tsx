"use client";

import type { MenuEntryWithRecipe } from "@bespoke/schema/schema/menuEntries";
import { clsx } from "clsx";
import { type ComponentProps, use } from "react";
import { MenuEntryProfitLabel } from "@/features/menus/entries/components/MenuEntryProfitLabel";
import { UpdateEntryDialog } from "@/features/menus/entries/components/UpdateEntryDialog";
import { getRecipeCost } from "@/features/recipes/metrics/utils/getRecipeCost";
import { FormatterContext } from "@/hooks/useFormatter";

import styles from "./styles.module.css";

export function MenuEntryNameAdornment({
	entry,
	editable,
	className,
	...props
}: ComponentProps<"div"> & {
	entry: MenuEntryWithRecipe;
	editable?: boolean;
}) {
	const { currencyFormatter } = use(FormatterContext);
	const { cost, isIncomplete } = getRecipeCost(entry.recipe);

	const priceLabel =
		typeof entry.price === "number"
			? currencyFormatter.format(entry.price)
			: "No price";

	if (!editable) {
		return <div className={clsx(styles.price, className)}>{priceLabel}</div>;
	}

	return (
		<div {...props} className={clsx(styles.adornment, className)}>
			<UpdateEntryDialog
				entry={entry}
				title="Update price"
				variant="base"
				color="heavy"
				size="small"
				className={clsx(styles.price, styles.button)}
			>
				{priceLabel}
			</UpdateEntryDialog>

			<MenuEntryProfitLabel
				as="div"
				size={0}
				align="right"
				price={entry.price}
				cost={cost}
				isIncomplete={isIncomplete}
				className={styles.profit}
			/>
		</div>
	);
}
