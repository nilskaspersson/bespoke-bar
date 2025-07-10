"use client";

import { type ComponentProps, useContext, useMemo } from "react";
import {
	type PreparationMethod,
	preparationMethods,
} from "@/db/schema/preparationMethods";
import {
	METHOD_TO_DEFAULT_DILUTION,
	METHOD_TO_LABEL,
} from "@/features/recipes/constants";
import { FormatterContext } from "@/hooks/useFormatter";
import { Select } from "@/ui/Select";
import { Text } from "@/ui/Text";
import { collator } from "@/utils/collator";
import { withKey } from "@/utils/withKey";

type Option = {
	value: PreparationMethod;
	label: React.ReactNode;
};

const getItemValue = (item: Option) => item.value;
const getItemLabel = (item: Option) => item.label;

const itemToString = (item: Option | null) =>
	!item ? "" : (METHOD_TO_LABEL.get(item.value) ?? item.value);

export function SelectPreparationMethod(
	props: Omit<
		ComponentProps<typeof Select<Option>>,
		"items" | "itemToString" | "getItemValue" | "getItemLabel"
	>,
) {
	const { percentageFormatter } = useContext(FormatterContext);

	const options = useMemo(
		() =>
			preparationMethods.options
				.map((item) =>
					withKey({
						value: item,
						label: (
							<>
								<Text as="div" heavy weight={600}>
									{METHOD_TO_LABEL.get(item) ?? item}
								</Text>

								{METHOD_TO_DEFAULT_DILUTION.has(item) ? (
									<Text size={1} compact>
										Default dilution:{" "}
										{percentageFormatter.format(
											METHOD_TO_DEFAULT_DILUTION.get(item) ?? 0,
										)}
										.
									</Text>
								) : null}
							</>
						),
					}),
				)
				.sort((a, b) => collator.compare(itemToString(a), itemToString(b))),
		[percentageFormatter],
	);

	return (
		<Select
			items={options}
			itemToString={itemToString}
			getItemValue={getItemValue}
			getItemLabel={getItemLabel}
			{...props}
		/>
	);
}
