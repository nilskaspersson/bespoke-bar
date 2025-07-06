"use client";

import type { ComponentProps } from "react";
import { supportedMeasurements } from "@/db/schema/units";
import {
	MEASUREMENT_TO_DESCRIPTION,
	MEASUREMENT_TO_LABEL,
} from "@/features/ingredients/constants";
import { Select } from "@/ui/Select";
import { Text } from "@/ui/Text";
import { collator } from "@/utils/formatting";
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
				<>
					<Text as="div" heavy>
						{MEASUREMENT_TO_LABEL.get(item) ?? item}
					</Text>

					{MEASUREMENT_TO_DESCRIPTION.has(item) ? (
						<Text size={1} compact>
							{MEASUREMENT_TO_DESCRIPTION.get(item)}
						</Text>
					) : null}
				</>
			),
		}),
	)
	.sort((a, b) => collator.compare(itemToString(a), itemToString(b)));

export function SelectMeasurementType(
	props: Partial<ComponentProps<typeof Select<Option>>>,
) {
	return (
		<Select
			label="Measurement type"
			name="measurementType"
			items={OPTIONS}
			itemToString={itemToString}
			getItemValue={getItemValue}
			getItemLabel={getItemLabel}
			{...props}
		/>
	);
}
