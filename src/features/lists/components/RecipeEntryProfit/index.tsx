"use client";

import { clsx } from "clsx";
import type { ComponentProps } from "react";
import type { BaseRecipe } from "@/db/schema/recipes";
import { getRecipeCost } from "@/features/recipes/utils/getRecipeCost";
import { useFormatter } from "@/hooks/useFormatter";
import { Callout } from "@/ui/Callout";
import { Grid } from "@/ui/Grid";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

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

				<Text
					heavy
					weight={600}
					className={clsx({
						[styles.negative]: price - cost < 0,
					})}
				>
					{currencyFormatter.format((price - cost) * servings)}
					{isIncomplete ? "*" : null}
				</Text>
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

							<Text
								as="td"
								heavy
								weight={600}
								align="right"
								className={clsx({
									[styles.negative]: price - cost < 0,
								})}
							>
								{currencyFormatter.format(price - cost)}
								{isIncomplete ? "*" : null}
							</Text>
						</tr>

						{servings > 1 ? (
							<tr>
								<Text as="th" heavy weight={600}>
									Total profit ({quantityFormatter.format(servings)} servings)
								</Text>

								<Text
									as="td"
									heavy
									weight={600}
									align="right"
									className={clsx({
										[styles.negative]: price - cost < 0,
									})}
								>
									{currencyFormatter.format((price - cost) * servings)}
									{isIncomplete ? "*" : null}
								</Text>
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
