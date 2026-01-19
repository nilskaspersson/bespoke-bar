"use client";

import { type ComponentProps, use } from "react";
import type { BaseRecipe } from "@/db/schema/recipes";
import { calculateRecipeMetrics } from "@/features/recipes/metrics/utils/calculateRecipeMetrics";
import { useRoundedUnit } from "@/features/units/hooks/useRoundedUnit";
import { isBartendingUnit } from "@/features/units/utils";
import { convert, type UnitSystems } from "@/features/units/utils/convert";
import { FormatterContext } from "@/hooks/useFormatter";
import { Callout } from "@/ui/Callout";
import { Grid } from "@/ui/Grid";
import { Text } from "@/ui/Text";
import { getKey } from "@/utils/withKey";

export function VolumeInfo<T extends BaseRecipe>({
	recipe,
	diluted = true,
	servings = 1,
	convertUnits = "metric",
	...props
}: {
	recipe: T;
	diluted?: boolean;
	servings?: number;
	convertUnits?: UnitSystems | null;
} & Omit<ComponentProps<"details">, "children">) {
	const { quantityFormatter, percentageFormatter } = use(FormatterContext);
	const roundUnit = useRoundedUnit();

	const recipeMetrics = calculateRecipeMetrics(recipe, { servings });

	const hasEstimatedVolumes = recipe.specs?.some((spec) =>
		isBartendingUnit(spec.unit),
	);

	return (
		<details {...props}>
			<Text as="summary" size={1} compact>
				{typeof servings === "number" && servings === 1
					? "Volume per serving: "
					: `Total volume (${quantityFormatter.format(servings)} servings): `}
				<Text heavy weight={600}>
					{roundUnit(
						diluted ? recipeMetrics.finalVolume : recipeMetrics.originalVolume,
						convertUnits,
					)}
				</Text>
			</Text>

			<Grid gap={2} justifyItems="start">
				<Text as="table" size={1}>
					<tbody>
						<tr>
							<th>Undiluted volume</th>
							<td>{roundUnit(recipeMetrics.originalVolume, convertUnits)}</td>
						</tr>

						<tr>
							<th>Water</th>
							<td>
								{roundUnit(recipeMetrics.dilutionVolume, convertUnits)} (
								{percentageFormatter.format(
									recipeMetrics.dilutionOfOriginalVolume,
								)}{" "}
								of undiluted volume)
							</td>
						</tr>

						<tr>
							<th>Water percentage</th>
							<td>
								{percentageFormatter.format(
									recipeMetrics.dilutionOfFinalVolume,
								)}
							</td>
						</tr>

						<tr>
							<th>Final volume</th>
							<td>{roundUnit(recipeMetrics.finalVolume, convertUnits)}</td>
						</tr>
					</tbody>
				</Text>

				{hasEstimatedVolumes ? (
					<Callout
						size={1}
						icon="circle-exclamation"
						color="light"
						heading="Volume estimates:"
					>
						<Text as="ul" list>
							{recipe.specs
								?.filter((spec) => isBartendingUnit(spec.unit))
								.map((spec) => {
									if (!spec.quantity || !spec.unit) {
										return null;
									}

									const unitData = convert().describe(spec.unit);
									const qty = spec.quantity * servings;

									return (
										<li key={getKey(spec)}>
											{qty} {qty > 1 ? unitData.plural : unitData.singular}{" "}
											{spec.ingredient.name} ={" "}
											{roundUnit(
												convert(spec.quantity).from(spec.unit).to("ml") * qty,
												convertUnits,
											)}
										</li>
									);
								})}
						</Text>
					</Callout>
				) : null}
			</Grid>
		</details>
	);
}
