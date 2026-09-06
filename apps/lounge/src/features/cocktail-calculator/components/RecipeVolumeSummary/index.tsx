"use client";

import { calculateRecipeMetrics } from "@bespoke/domain/recipes/calculateRecipeMetrics";
import { METHOD_TO_LABEL } from "@bespoke/domain/recipes/labels";
import type { PreparationMethod } from "@bespoke/schema/schema/preparationMethods";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { useRoundedUnit } from "@bespoke/ui/hooks/useRoundedUnit";
import { useAdjustments } from "@bespoke/ui/RecipeAdjustments";
import { SelectDilution } from "@bespoke/ui/SelectDilution";
import { SelectPreparationMethod } from "@bespoke/ui/SelectPreparationMethod";
import { StatsLine } from "@bespoke/ui/StatsLine";
import { Text } from "@bespoke/ui/Text";
import { use, useId } from "react";
import styles from "./styles.module.css";

export function RecipeVolumeSummary({
	recipe,
	method,
	dilutionTarget,
	onMethodChange,
	onDilutionChange,
}: {
	recipe: BaseRecipe;
	method: PreparationMethod;
	dilutionTarget: number;
	onMethodChange: (method: PreparationMethod) => void;
	onDilutionChange: (dilutionTarget: number) => void;
}) {
	const { percentageFormatter } = use(FormatterContext);
	const { servings, conversionSystem } = useAdjustments();
	const roundUnit = useRoundedUnit();
	const name = useId();

	const metrics = calculateRecipeMetrics(
		{ ...recipe, dilutionTarget },
		{ servings },
	);

	function volume(volumeInMl: number) {
		return metrics.originalVolume === 0
			? "-"
			: roundUnit(volumeInMl, conversionSystem);
	}

	return (
		<Grid gap={3}>
			<Flex gap={4}>
				<StatsLine size={3} overline="Undiluted volume">
					{volume(metrics.originalVolume)}
				</StatsLine>

				<StatsLine size={3} overline="Diluted volume">
					{volume(metrics.finalVolume)}{" "}
					{metrics.finalVolume > 0 ? (
						<Text size={1} light compact>
							({roundUnit(metrics.dilutionVolume, conversionSystem)} water)
						</Text>
					) : null}
				</StatsLine>
			</Flex>

			<details>
				<Text as="summary" size={1} light compact className={styles.summary}>
					{METHOD_TO_LABEL.get(method) ?? method} ·{" "}
					{percentageFormatter.format(dilutionTarget)} dilution
				</Text>

				<Grid gap={4} className={styles.controls}>
					<SelectPreparationMethod
						name={`${name}-method`}
						label="Preparation method"
						defaultValue={method}
						compact
						selectProps={{
							onSelectedItemChange: ({ selectedItem }) => {
								if (selectedItem) {
									onMethodChange(selectedItem.value);
								}
							},
						}}
					/>

					<SelectDilution
						key={method}
						name={`${name}-dilution`}
						defaultValue={dilutionTarget}
						onChange={onDilutionChange}
						helperText={null}
					/>
				</Grid>
			</details>
		</Grid>
	);
}
