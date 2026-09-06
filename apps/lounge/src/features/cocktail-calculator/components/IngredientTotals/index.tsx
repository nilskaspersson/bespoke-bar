"use client";

import { aggregateIngredientTotals } from "@bespoke/domain/recipes/aggregateIngredientTotals";
import { DB_UNIT_TO_LIB_UNIT } from "@bespoke/domain/units/constants";
import { convertFactor } from "@bespoke/domain/units/convert";
import { getFormattedUnit } from "@bespoke/domain/units/getFormattedUnit";
import { isBartendingUnit } from "@bespoke/domain/units/predicates";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import type { Unit } from "@bespoke/schema/schema/units";
import { Callout } from "@bespoke/ui/Callout";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { useFormatLineMeasure } from "@bespoke/ui/hooks/useFormatLineMeasure";
import { useRoundedUnit } from "@bespoke/ui/hooks/useRoundedUnit";
import { Icon } from "@bespoke/ui/Icon";
import { Panel, type PanelProps } from "@bespoke/ui/Panel";
import { useAdjustments } from "@bespoke/ui/RecipeAdjustments";
import { ServingsBadge } from "@bespoke/ui/ServingsBadge";
import { Text } from "@bespoke/ui/Text";
import { Tooltip } from "@bespoke/ui/Tooltip";
import { clsx } from "clsx";
import { useId, useMemo } from "react";
import styles from "./styles.module.css";

export function IngredientTotals({
	recipes,
	...props
}: Omit<PanelProps<"section">, "children" | "header"> & {
	recipes: BaseRecipe[];
}) {
	const labelId = useId();
	const formatLineMeasure = useFormatLineMeasure();
	const roundUnit = useRoundedUnit();
	const { servings, conversionSystem, withRounding, withBestUnit } =
		useAdjustments();

	const { ingredients, totalVolumeInMl } = useMemo(
		() => aggregateIngredientTotals(recipes),
		[recipes],
	);

	function measure(quantity: number | null, unit: Unit | null) {
		if (!quantity) {
			return "-";
		}

		return formatLineMeasure({
			line: { quantity, unit },
			servings,
			convertUnits: conversionSystem,
			withRounding,
			withBestUnit,
		}).formatted.trim();
	}

	const hasEstimates = ingredients.some(({ unit }) => isBartendingUnit(unit));
	const hasCounts = ingredients.some(
		({ unit, quantity }) => unit === null && quantity !== null,
	);

	function unitEstimate(unit: Unit, quantity: number, volumeInMl: number) {
		const libUnit = DB_UNIT_TO_LIB_UNIT.get(unit);

		if (!libUnit) {
			return null;
		}

		const ratio = `1 ${getFormattedUnit(unit, 1)} ≈ ${roundUnit(
			convertFactor(libUnit, "ml"),
			conversionSystem,
		)}`;

		if (quantity * servings === 1) {
			return ratio;
		}

		const scaled = formatLineMeasure({
			line: { quantity, unit },
			servings,
			withRounding,
		}).formatted.trim();

		return (
			<>
				{ratio}
				<br />
				{scaled} ≈ {roundUnit(volumeInMl * servings, conversionSystem)}
			</>
		);
	}

	return (
		<Panel
			as="section"
			aria-labelledby={labelId}
			{...props}
			header={
				<Flex alignItems="center" gap={2} justifyContent="space-between">
					<Flex alignItems="center" gap={2}>
						<Icon name="table-list" size={3} />

						<Text id={labelId} heavy weight={600}>
							Ingredient totals
						</Text>
					</Flex>

					{servings > 1 ? <ServingsBadge servings={servings} /> : null}
				</Flex>
			}
		>
			<Grid gap={2}>
				<table className={styles.table}>
					<thead>
						<tr>
							<Text
								as="th"
								scope="col"
								size={0}
								light
								compact
								className={clsx(styles.columnHeader, styles.name)}
							>
								Ingredient
							</Text>

							<Text
								as="th"
								scope="col"
								size={0}
								light
								compact
								align="right"
								className={clsx(styles.columnHeader, styles.shrink)}
							>
								Recipes
							</Text>

							<Text
								as="th"
								scope="col"
								size={0}
								light
								compact
								align="right"
								className={clsx(styles.columnHeader, styles.shrink)}
							>
								Total
							</Text>
						</tr>
					</thead>

					<tbody>
						{ingredients.length === 0 ? (
							<tr>
								<Text
									as="th"
									scope="row"
									serif
									size={3}
									className={styles.name}
								>
									-
								</Text>

								<Text
									as="td"
									size={3}
									light
									numeric
									align="right"
									className={styles.shrink}
								>
									-
								</Text>

								<Text
									as="td"
									size={3}
									numeric
									align="right"
									className={styles.shrink}
								>
									-
								</Text>
							</tr>
						) : null}

						{ingredients.map((total) => {
							const estimate =
								total.unit && total.quantity && isBartendingUnit(total.unit)
									? unitEstimate(total.unit, total.quantity, total.volumeInMl)
									: null;

							const value = estimate
								? roundUnit(total.volumeInMl * servings, conversionSystem)
								: measure(total.quantity, total.unit);

							return (
								<tr key={total.name}>
									<Text
										as="th"
										scope="row"
										serif
										size={3}
										className={styles.name}
									>
										{total.name}

										{total.optional ? (
											<Text
												as="span"
												size={1}
												light
												className={styles.optional}
											>
												(optional)
											</Text>
										) : null}
									</Text>

									<Text
										as="td"
										size={3}
										light
										numeric
										align="right"
										className={styles.shrink}
									>
										{total.recipeCount}
									</Text>

									<Text
										as="td"
										size={3}
										numeric
										align="right"
										className={styles.shrink}
									>
										{estimate ? (
											<Tooltip content={estimate} className={styles.estimate}>
												{value}
											</Tooltip>
										) : (
											value
										)}
									</Text>
								</tr>
							);
						})}
					</tbody>

					<tfoot>
						<tr>
							<Text
								as="th"
								scope="row"
								colSpan={2}
								size={2}
								light
								className={styles.total}
							>
								Total volume (undiluted)
							</Text>

							<Text
								as="td"
								size={3}
								numeric
								weight={600}
								align="right"
								className={clsx(styles.shrink, styles.total)}
							>
								{measure(totalVolumeInMl, "ml")}
							</Text>
						</tr>
					</tfoot>
				</table>

				{hasEstimates ? (
					<Callout size={1} color="regular" icon="circle-info">
						Dashes, drops and other bartending measures have estimated volumes.
					</Callout>
				) : null}

				{hasCounts ? (
					<Callout size={1} color="regular" icon="circle-info">
						Unitless lines are not included in the total volume.
					</Callout>
				) : null}
			</Grid>
		</Panel>
	);
}
