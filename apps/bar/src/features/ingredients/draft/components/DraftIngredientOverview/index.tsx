"use client";

import { CATEGORY_TO_LABEL } from "@bespoke/domain/categories/labels";
import { isSystemCategory } from "@bespoke/domain/categories/matchNameWithCategory";
import {
	getMeasurementPriceUnit,
	isMeasurementType,
} from "@bespoke/domain/units/predicates";
import type {
	IngredientFormData,
	RecipeFormData,
} from "@bespoke/schema/schema/composite";
import { Abv } from "@bespoke/ui/Abv";
import { useFormatIngredientUnitCost } from "@bespoke/ui/hooks/useFormatIngredientUnitCost";
import { Text } from "@bespoke/ui/Text";
import { type FieldName, useField } from "@conform-to/react";
import { MEASUREMENT_TO_LABEL } from "@/features/ingredients/constants";

export function DraftIngredientOverview({
	name,
}: {
	name: FieldName<IngredientFormData, RecipeFormData>;
}) {
	const formatIngredientUnitCost = useFormatIngredientUnitCost();

	const [field] = useField(name);
	const ingredient = field.getFieldset();

	return (
		<Text as="table" size={1}>
			<tbody>
				<tr>
					<Text as="th" heavy weight={600}>
						Ingredient
					</Text>

					<Text as="td">{ingredient.name.value}</Text>
				</tr>

				<tr>
					<Text as="th" heavy weight={600}>
						Category
					</Text>

					<Text as="td">
						{isSystemCategory(ingredient.category.value)
							? CATEGORY_TO_LABEL.get(ingredient.category.value)
							: null}
					</Text>
				</tr>

				<tr>
					<Text as="th" heavy weight={600}>
						Description
					</Text>

					<Text as="td">{ingredient.description.value}</Text>
				</tr>

				<tr>
					<Text as="th" heavy weight={600}>
						<Abv />
					</Text>

					<Text as="td">{ingredient.abv.value}</Text>
				</tr>

				<tr>
					<Text as="th" heavy weight={600}>
						Measurement type
					</Text>

					<Text as="td">
						{isMeasurementType(ingredient.measurementType.value)
							? MEASUREMENT_TO_LABEL.get(ingredient.measurementType.value)
							: null}
					</Text>
				</tr>

				<tr>
					<Text as="th" heavy weight={600}>
						Cost per {getMeasurementPriceUnit(ingredient.measurementType.value)}
					</Text>

					<Text as="td">
						{ingredient.unitCost.value &&
						isMeasurementType(ingredient.measurementType.value)
							? formatIngredientUnitCost(
									Number(ingredient.unitCost.value),
									ingredient.measurementType.value,
								)
							: null}
					</Text>
				</tr>

				<tr>
					<Text as="th" heavy weight={600}>
						Brand
					</Text>

					<Text as="td">{ingredient.brand.value}</Text>
				</tr>
			</tbody>
		</Text>
	);
}
