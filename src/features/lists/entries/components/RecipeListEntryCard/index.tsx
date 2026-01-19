"use client";

import { type ReactNode, use } from "react";
import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";
import { ListEntryActions } from "@/features/lists/actions/components/ListEntryActions";
import { RecipeEntryProfitLabel } from "@/features/lists/entries/components/RecipeEntryProfitLabel";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { getRecipeCost } from "@/features/recipes/metrics/utils/getRecipeCost";
import { FormatterContext } from "@/hooks/useFormatter";
import { Text } from "@/ui/Text";

import styles from "./styles.module.css";

type Props = {
	entry: RecipeListEntryWithRecipe;
	className?: string;
	editable?: boolean;
	children?: ReactNode;
};

export function RecipeListEntryCard({
	entry,
	className,
	editable,
	children,
}: Props) {
	const { currencyFormatter } = use(FormatterContext);
	const { cost, isIncomplete } = getRecipeCost(entry.recipe);

	return (
		<RecipeCard
			className={className}
			recipe={entry.recipe}
			nameAdornment={
				<div className={styles.adornment}>
					<Text as="div" heavy weight={800} size={2} align="right" numeric>
						{typeof entry.price === "number"
							? currencyFormatter.format(entry.price)
							: "No price"}
					</Text>

					{editable ? (
						<RecipeEntryProfitLabel
							as="div"
							size={0}
							align="right"
							price={entry.price}
							cost={cost}
							isIncomplete={isIncomplete}
							className={styles.profit}
						/>
					) : null}
				</div>
			}
		>
			{children}

			{editable ? <ListEntryActions entry={entry} /> : null}
		</RecipeCard>
	);
}
