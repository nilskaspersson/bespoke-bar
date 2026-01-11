"use client";

import type { ComponentProps } from "react";
import type { BaseRecipe } from "@/db/schema/recipes";
import { RecipeEntryProfitLabel } from "@/features/lists/entries/components/RecipeEntryProfitLabel";
import { getRecipeCost } from "@/features/recipes/metrics/utils/getRecipeCost";
import { useFormatter } from "@/hooks/useFormatter";
import { Callout } from "@/ui/Callout";
import { Grid } from "@/ui/Grid";
import { Text } from "@/ui/Text";

export function RecipeEntryProfit<T extends BaseRecipe>({
	recipe,
	price,
	servings = 1,
	...props
}: { recipe: T; price: number; servings?: number } & Omit<
	ComponentProps<"details">,
	"children"
>) {
	const { cost, isIncomplete } = getRecipeCost(recipe);

	const { currencyFormatter, quantityFormatter } = useFormatter();

	return (
		<details {...props}>
			<Text as="summary" size={1} compact>
				{typeof servings === "number" && servings === 1
					? "Profit per serving: "
					: `Total profit (${quantityFormatter.format(servings)} servings): `}

				<RecipeEntryProfitLabel
					heavy
					weight={600}
					cost={cost}
					price={price}
					servings={servings}
				/>
			</Text>

			<Grid gap={2} justifyItems="start">
				<Text as="table" size={1}>
					<tbody>
						<tr>
							<Text as="th">Price per serving</Text>
							<Text as="td" align="right">
								{currencyFormatter.format(price)}
							</Text>
						</tr>

						{servings > 1 ? (
							<tr>
								<Text as="th">
									Total price ({quantityFormatter.format(servings)} servings)
								</Text>
								<Text as="td" align="right">
									{currencyFormatter.format(price * servings)}
								</Text>
							</tr>
						) : null}

						<tr>
							<Text as="th">Cost per serving</Text>
							<Text as="td" align="right">
								{currencyFormatter.format(cost)}
							</Text>
						</tr>

						{servings > 1 ? (
							<tr>
								<Text as="th">
									Total cost ({quantityFormatter.format(servings)} servings)
								</Text>
								<Text as="td" align="right">
									{currencyFormatter.format(cost * servings)}
								</Text>
							</tr>
						) : null}
					</tbody>

					<tfoot>
						<tr>
							<Text as="th" heavy weight={600}>
								Profit per serving
							</Text>

							<RecipeEntryProfitLabel
								as="td"
								heavy
								weight={600}
								align="right"
								cost={cost}
								price={price}
								servings={1}
							/>
						</tr>

						{servings > 1 ? (
							<tr>
								<Text as="th" heavy weight={600}>
									Total profit ({quantityFormatter.format(servings)} servings)
								</Text>

								<RecipeEntryProfitLabel
									as="td"
									heavy
									weight={600}
									align="right"
									cost={cost}
									price={price}
									servings={servings}
								/>
							</tr>
						) : null}
					</tfoot>
				</Text>

				{isIncomplete ? (
					<Callout color="amber" size={1} icon="triangle-exclamation">
						Some ingredients are missing price information.
					</Callout>
				) : null}
			</Grid>
		</details>
	);
}
