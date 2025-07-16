"use client";

import { useContext } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { Abv } from "@/features/ingredients/components/Abv";
import { useFormatIngredientUnitCost } from "@/features/ingredients/hooks/useFormatIngredientUnitCost";
import { getMeasurementPriceUnit } from "@/features/units/utils";
import { FormatterContext } from "@/hooks/useFormatter";
import { Chip } from "@/ui/Chip";
import { Flex } from "@/ui/Flex";

export function IngredientChips({
	ingredient,
	recipesCount,
}: {
	ingredient: Ingredient;
	recipesCount: number;
}) {
	const formatIngredientUnitCost = useFormatIngredientUnitCost();
	const { percentageFormatter } = useContext(FormatterContext);

	return (
		<Flex gap={2} wrap justifyContent="center">
			<Chip label={<Abv />}>
				{ingredient.abv ? percentageFormatter.format(ingredient.abv) : "-"}
			</Chip>

			<Chip label="Brand">{ingredient.brand ?? "-"}</Chip>

			<Chip
				label={`Cost per ${getMeasurementPriceUnit(ingredient.measurementType)}`}
			>
				{ingredient.unitCost && ingredient.measurementType
					? formatIngredientUnitCost(
							ingredient.unitCost,
							ingredient.measurementType,
						)
					: "-"}
			</Chip>

			<Chip label="Recipes">{recipesCount}</Chip>
		</Flex>
	);
}
