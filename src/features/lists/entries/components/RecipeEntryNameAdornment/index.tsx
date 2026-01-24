import { clsx } from "clsx";
import { type ComponentProps, use } from "react";
import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";
import { RecipeEntryProfitLabel } from "@/features/lists/entries/components/RecipeEntryProfitLabel";
import { UpdateRecipeEntryFormDialog } from "@/features/lists/entries/components/UpdateRecipeEntryFormDialog";
import { getRecipeCost } from "@/features/recipes/metrics/utils/getRecipeCost";
import { FormatterContext } from "@/hooks/useFormatter";
import { ToggleDrawerButton } from "@/ui/ToggleDrawerButton";

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
			<ToggleDrawerButton
				aria-label="Update price"
				title="Update price"
				variant="base"
				color="heavy"
				size="small"
				className={clsx(styles.price, styles.button)}
				label={priceLabel}
			>
				<UpdateRecipeEntryFormDialog
					entry={entry}
					key={entry.updatedAt?.toISOString()}
				/>
			</ToggleDrawerButton>

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
