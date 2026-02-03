"use client";

import { type ComponentProps, use } from "react";
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
	size = 3,
	color = "regular",
	...props
}: {
	ingredient: Ingredient;
	recipesCount?: number;
	size?: ComponentProps<typeof Chip>["size"];
	color?: ComponentProps<typeof Chip>["color"];
} & Omit<ComponentProps<typeof Flex>, "children">) {
	const formatIngredientUnitCost = useFormatIngredientUnitCost();
	const { percentageFormatter } = use(FormatterContext);

	return (
		<Flex gap={2} wrap justifyContent="center" {...props}>
			<Chip label={<Abv />} size={size} color={color} className={styles.chip}>
				{ingredient.abv != null
					? percentageFormatter.format(ingredient.abv)
					: "-"}
			</Chip>

			<Chip label="Brand" size={size} color={color} className={styles.chip}>
				{ingredient.brand ?? "-"}
			</Chip>

			<Chip
				label={`Cost per ${getMeasurementPriceUnit(ingredient.measurementType)}`}
				size={size}
				color={color}
				className={styles.chip}
			>
				{ingredient.unitCost && ingredient.measurementType
					? formatIngredientUnitCost(
							ingredient.unitCost,
							ingredient.measurementType,
						)
					: "-"}
			</Chip>

			{recipesCount != null ? (
				<Chip label="Recipes" size={size} color={color} className={styles.chip}>
					{recipesCount}
				</Chip>
			) : null}
		</Flex>
	);
}
