"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import type { BaseRecipe } from "@/db/schema/recipes";
import { getRecipeCost } from "@/features/recipes/metrics/utils/getRecipeCost";
import { useFormatSpecMeasure } from "@/features/specs/hooks/useFormatSpecMeasure";
import { getSpecCost } from "@/features/specs/utils/getSpecCost";
import type { UnitSystems } from "@/features/units/utils/convert";
import { useFormatter } from "@/hooks/useFormatter";
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

	const { currencyFormatter, quantityFormatter } = useFormatter();
	const formatSpecMeasure = useFormatSpecMeasure();

	return (
		<details {...props}>
			<Text as="summary" size={1} compact>
				{typeof servings === "number" && servings === 1
					? "Cost per serving: "
					: `Total cost (${quantityFormatter.format(servings)} servings): `}

				<Text heavy weight={600}>
					{currencyFormatter.format(cost * servings)}
					{isIncomplete ? "*" : null}
				</Text>
			</Text>

			<Grid gap={2} justifyItems="start">
				{servings > 1 ? (
					<Callout size={1} color="regular">
						Cost per serving:{" "}
						<Text compact heavy weight={600}>
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
						{recipe.specs?.map((spec) => {
							const cost = getSpecCost(spec);

							return (
								<tr key={getKey(spec)}>
									<Text as="td">
										<Link
											href={`/bar/ingredients/${spec.ingredient.id}`}
											prefetch={false}
										>
											{spec.ingredient.name}
										</Link>
									</Text>

									<Text as="td" align="right">
										{formatSpecMeasure({ spec, servings, convertUnits })}
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
