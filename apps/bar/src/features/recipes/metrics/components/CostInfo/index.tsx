"use client";

import { getLineCost } from "@bespoke/domain/ingredientLines/getLineCost";
import { getRecipeCost } from "@bespoke/domain/recipes/getRecipeCost";
import type { UnitSystems } from "@bespoke/domain/units/convert";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import Link from "next/link";
import { type ComponentProps, use } from "react";
import { useFormatLineMeasure } from "@/features/ingredientLines/hooks/useFormatLineMeasure";
import { FormatterContext } from "@/hooks/useFormatter";
import { Callout } from "@/ui/Callout";
import { Grid } from "@/ui/Grid";
import { Text } from "@/ui/Text";
import { getKey } from "@/utils/withKey";

export function CostInfo<T extends BaseRecipe>({
	recipe,
	servings = 1,
	convertUnits,
	...props
}: { recipe: T; servings?: number; convertUnits?: UnitSystems | null } & Omit<
	ComponentProps<"details">,
	"children"
>) {
	const { cost, isIncomplete } = getRecipeCost(recipe);

	const { currencyFormatter, quantityFormatter } = use(FormatterContext);
	const formatLineMeasure = useFormatLineMeasure();

	return (
		<details {...props}>
			<Text as="summary" size={1} compact>
				{typeof servings === "number" && servings === 1 ? (
					"Cost per serving: "
				) : (
					<>
						Total cost (
						<Text numeric compact size={1}>
							{quantityFormatter.format(servings)}
						</Text>{" "}
						servings):{" "}
					</>
				)}

				<Text heavy weight={600}>
					{currencyFormatter.format(cost * servings)}
					{isIncomplete ? "*" : null}
				</Text>
			</Text>

			<Grid gap={2} justifyItems="start">
				{servings > 1 ? (
					<Callout size={1} color="regular">
						Cost per serving:{" "}
						<Text compact heavy weight={600} numeric>
							{currencyFormatter.format(cost)}
							{isIncomplete ? "*" : null}
						</Text>
					</Callout>
				) : null}

				<Text as="table" size={1}>
					<thead>
						<Text as="tr" heavy weight={600}>
							<th>Ingredient</th>
							<th>Measure</th>
							<th>Cost {servings > 1 ? "per serving" : null}</th>
							{servings > 1 ? <th>Total cost</th> : null}
						</Text>
					</thead>

					<tbody>
						{recipe.lines?.map((line) => {
							const cost = getLineCost(line);

							return (
								<tr key={getKey(line)}>
									<Text as="td">
										<Link
											href={`/bar/ingredients/${line.ingredient.id}`}
											prefetch={false}
										>
											{line.ingredient.name}
										</Link>
									</Text>

									<Text as="td" align="right">
										{
											formatLineMeasure({ line, servings, convertUnits })
												.formatted
										}
									</Text>

									<Text as="td" align="right">
										{typeof cost === "number"
											? currencyFormatter.format(cost)
											: "-"}
									</Text>

									{servings > 1 ? (
										<Text as="td" align="right">
											{typeof cost === "number"
												? currencyFormatter.format(cost * servings)
												: "-"}
										</Text>
									) : null}
								</tr>
							);
						})}
					</tbody>
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
