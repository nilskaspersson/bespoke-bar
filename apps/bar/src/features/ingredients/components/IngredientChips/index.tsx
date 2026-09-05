"use client";

import { getMeasurementPriceUnit } from "@bespoke/domain/units/predicates";
import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { Abv } from "@bespoke/ui/Abv";
import { Button } from "@bespoke/ui/Button";
import { Chip, type ChipProps } from "@bespoke/ui/Chip";
import { EnrichmentMark } from "@bespoke/ui/EnrichmentMark";
import { Flex, type FlexProps } from "@bespoke/ui/Flex";
import { useFormatIngredientUnitCost } from "@bespoke/ui/hooks/useFormatIngredientUnitCost";
import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { useIngredientEditor } from "@bespoke/ui/stores/ingredientEditor";
import { type ReactNode, use } from "react";
import styles from "./styles.module.css";

function EditableChip({
	children,
	ingredient,
}: {
	children: ReactNode;
	ingredient: Ingredient;
}) {
	const open = useIngredientEditor((s) => s.open);

	return (
		<Button
			variant="base"
			title="Edit ingredient"
			onClick={() => open(ingredient)}
		>
			{children}
		</Button>
	);
}

export function IngredientChips({
	ingredient,
	recipesCount,
	size = 3,
	color = "regular",
	editable = false,
	...props
}: {
	ingredient: Ingredient;
	recipesCount?: number;
	size?: ChipProps["size"];
	color?: ChipProps["color"];
	editable?: boolean;
} & Omit<FlexProps, "children">) {
	const formatIngredientUnitCost = useFormatIngredientUnitCost();
	const { percentageFormatter } = use(FormatterContext);

	const enrichedFields = new Set(ingredient.aiEnrichedFields ?? []);

	function fieldValue(value: ReactNode, field: keyof Ingredient) {
		if (!enrichedFields.has(field)) {
			return value;
		}

		return (
			<Flex as="span" gap={1} alignItems="center">
				<EnrichmentMark />
				{value}
			</Flex>
		);
	}

	return (
		<Flex gap={2} wrap justifyContent="center" {...props}>
			<EditableChip ingredient={ingredient}>
				<Chip label={<Abv />} size={size} color={color} className={styles.chip}>
					{fieldValue(
						ingredient.abv != null
							? percentageFormatter.format(ingredient.abv)
							: "-",
						"abv",
					)}
				</Chip>
			</EditableChip>

			<EditableChip ingredient={ingredient}>
				<Chip
					label="Brand"
					size={size}
					color={color}
					className={styles.chip}
					icon={enrichedFields.has("brand") ? <EnrichmentMark /> : null}
				>
					{ingredient.brand ?? "-"}
				</Chip>
			</EditableChip>

			<EditableChip ingredient={ingredient}>
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
			</EditableChip>

			{recipesCount != null ? (
				<Chip label="Recipes" size={size} color={color} className={styles.chip}>
					{recipesCount}
				</Chip>
			) : null}
		</Flex>
	);
}
