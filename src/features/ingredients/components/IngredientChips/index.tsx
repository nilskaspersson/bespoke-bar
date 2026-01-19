"use client";

import { use } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { Abv } from "@/features/ingredients/components/Abv";
import { useFormatIngredientUnitCost } from "@/features/ingredients/hooks/useFormatIngredientUnitCost";
import { getMeasurementPriceUnit } from "@/features/units/utils";
import { FormatterContext } from "@/hooks/useFormatter";
import { Chip } from "@/ui/Chip";
import { Flex } from "@/ui/Flex";
import styles from "./styles.module.css";

export function IngredientChips({
	ingredient,
	recipesCount,
}: {
	ingredient: Ingredient;
	recipesCount: number;
}) {
	const formatIngredientUnitCost = useFormatIngredientUnitCost();
	const { percentageFormatter } = use(FormatterContext);

	return (
		<Flex gap={2} wrap justifyContent="center">
			<Chip label={<Abv />} size={3} color="regular" className={styles.chip}>
				{ingredient.abv != null
					? percentageFormatter.format(ingredient.abv)
					: "-"}
			</Chip>

			<Chip label="Brand" size={3} color="regular" className={styles.chip}>
				{ingredient.brand ?? "-"}
			</Chip>

			<Chip
				label={`Cost per ${getMeasurementPriceUnit(ingredient.measurementType)}`}
				size={3}
				color="regular"
				className={styles.chip}
			>
				{ingredient.unitCost && ingredient.measurementType
					? formatIngredientUnitCost(
							ingredient.unitCost,
							ingredient.measurementType,
						)
					: "-"}
			</Chip>

			<Chip label="Recipes" size={3} color="regular" className={styles.chip}>
				{recipesCount}
			</Chip>
		</Flex>
	);
}
