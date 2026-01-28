"use client";

import { clsx } from "clsx";
import { type ComponentProps, use } from "react";
import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";
import { RecipeEntryProfitLabel } from "@/features/lists/entries/components/RecipeEntryProfitLabel";
import { UpdateEntryDialog } from "@/features/lists/entries/components/UpdateEntryDialog";
import { getRecipeCost } from "@/features/recipes/metrics/utils/getRecipeCost";
import { FormatterContext } from "@/hooks/useFormatter";

import styles from "./styles.module.css";

export function RecipeEntryNameAdornment({
	entry,
	editable,
	className,
	...props
}: ComponentProps<"div"> & {
	entry: RecipeListEntryWithRecipe;
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

			<RecipeEntryProfitLabel
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
