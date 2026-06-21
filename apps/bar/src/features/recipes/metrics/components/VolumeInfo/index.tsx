"use client";

import { calculateRecipeMetrics } from "@bespoke/domain/recipes/calculateRecipeMetrics";
import { convert, type UnitSystems } from "@bespoke/domain/units/convert";
import { isBartendingUnit } from "@bespoke/domain/units/predicates";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { type ComponentProps, use } from "react";
import { useRoundedUnit } from "@/features/units/hooks/useRoundedUnit";
import { FormatterContext } from "@/hooks/useFormatter";
import { Callout } from "@/ui/Callout";
import { Grid } from "@/ui/Grid";
import { Text } from "@/ui/Text";
import { getKey } from "@/utils/withKey";
import styles from "./styles.module.css";

export function VolumeInfo<T extends BaseRecipe>({
	recipe,
	diluted = true,
	servings = 1,
	convertUnits = "metric",
	disabled,
	...props
}: {
	recipe: T;
	diluted?: boolean;
	servings?: number;
	convertUnits?: UnitSystems | null;
	disabled?: boolean;
} & Omit<ComponentProps<"details">, "children">) {
	const { quantityFormatter, percentageFormatter } = use(FormatterContext);
	const roundUnit = useRoundedUnit();

	const recipeMetrics = calculateRecipeMetrics(recipe, { servings });

	const hasEstimatedVolumes = recipe.lines?.some((line) =>
		isBartendingUnit(line.unit),
	);

	const displayVolume = roundUnit(
		diluted ? recipeMetrics.finalVolume : recipeMetrics.originalVolume,
		convertUnits,
	);
	const originalVolume = roundUnit(recipeMetrics.originalVolume, convertUnits);
	const dilutionVolume = roundUnit(recipeMetrics.dilutionVolume, convertUnits);
	const finalVolume = roundUnit(recipeMetrics.finalVolume, convertUnits);

	return (
		<details {...props}>
			<Text
				as="summary"
				size={1}
				compact
				className={styles.summary}
				aria-disabled={disabled || undefined}
				tabIndex={disabled ? -1 : undefined}
			>
				{disabled ? (
					"Total volume"
				) : (
					<>
						{typeof servings === "number" && servings === 1 ? (
							"Volume per serving: "
						) : (
							<>
								Total volume (
								<Text numeric compact size={1}>
									{quantityFormatter.format(servings)}
								</Text>{" "}
								servings):{" "}
							</>
						)}

						<Text heavy weight={600} size={1} compact numeric>
							{displayVolume}
						</Text>
					</>
				)}
			</Text>

			{!disabled && (
				<Grid gap={2} justifyItems="start">
					<Text as="table" size={1}>
						<tbody>
							<tr>
								<th>Undiluted volume</th>
								<td>{originalVolume}</td>
							</tr>

							<tr>
								<th>Water</th>
								<td>
									{dilutionVolume} (
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
								<td>{finalVolume}</td>
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
								{recipe.lines
									?.filter((line) => isBartendingUnit(line.unit))
									.map((line) => {
										if (!line.quantity || !line.unit) {
											return null;
										}

										const unitData = convert().describe(line.unit);
										const qty = line.quantity * servings;
										const estimated = roundUnit(
											convert(line.quantity).from(line.unit).to("ml") * qty,
											convertUnits,
										);

										return (
											<li key={getKey(line)}>
												{qty} {qty > 1 ? unitData.plural : unitData.singular}{" "}
												{line.ingredient.name} = {estimated}
											</li>
										);
									})}
							</Text>
						</Callout>
					) : null}
				</Grid>
			)}
		</details>
	);
}
