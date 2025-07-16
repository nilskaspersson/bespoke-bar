"use client";

import type { ComponentProps } from "react";
import { supportedMeasurements } from "@/db/schema/units";
import {
	MEASUREMENT_TO_DESCRIPTION,
	MEASUREMENT_TO_LABEL,
} from "@/features/ingredients/constants";
import { OptionLabel } from "@/ui/OptionLabel";
import { Select } from "@/ui/Select";
import { collator } from "@/utils/collator";
import { withKey } from "@/utils/withKey";

type Option = (typeof OPTIONS)[number];

const getItemValue = (item: Option) => item.value;
const getItemLabel = (item: Option) => item.label;

const itemToString = (item: Option | null) =>
	!item ? "" : (MEASUREMENT_TO_LABEL.get(item.value) ?? item.value);

const OPTIONS = supportedMeasurements.options
	.map((item) =>
		withKey({
			value: item,
			label: (
				<OptionLabel description={MEASUREMENT_TO_DESCRIPTION.get(item)}>
					{MEASUREMENT_TO_LABEL.get(item) ?? item}
				</OptionLabel>
			),
		}),
	)
	.sort((a, b) => collator.compare(itemToString(a), itemToString(b)));

export function SelectMeasurementType(
	props: Omit<
		ComponentProps<typeof Select<Option>>,
		"items" | "itemToString" | "getItemValue" | "getItemLabel"
	>,
) {
	return (
		<Select
			label="Measurement type"
			items={OPTIONS}
			itemToString={itemToString}
			getItemValue={getItemValue}
			getItemLabel={getItemLabel}
			helperText={`Used for unit conversion and cost calculations. Choose "Volume" for liquids, "Mass" for solids, or "Pieces" for individual items (f.e., cherries, umbrellas).`}
			{...props}
		/>
	);
}
