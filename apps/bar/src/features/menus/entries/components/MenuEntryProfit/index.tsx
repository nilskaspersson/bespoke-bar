"use client";

import { getRecipeCost } from "@bespoke/domain/recipes/getRecipeCost";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { Callout } from "@bespoke/ui/Callout";
import { Grid } from "@bespoke/ui/Grid";
import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { Text } from "@bespoke/ui/Text";
import { type ComponentProps, use } from "react";
import { MenuEntryProfitLabel } from "@/features/menus/entries/components/MenuEntryProfitLabel";

export function MenuEntryProfit<T extends BaseRecipe>({
	recipe,
	price,
	servings = 1,
	...props
}: { recipe: T; price: number; servings?: number } & Omit<
	ComponentProps<"details">,
	"children"
>) {
	const { cost, isIncomplete } = getRecipeCost(recipe);

	const { currencyFormatter, quantityFormatter } = use(FormatterContext);

	return (
		<details {...props}>
			<Text as="summary" size={1} compact>
				{typeof servings === "number" && servings === 1
					? "Profit per serving: "
					: `Total profit (${quantityFormatter.format(servings)} servings): `}

				<MenuEntryProfitLabel
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

							<MenuEntryProfitLabel
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

								<MenuEntryProfitLabel
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
