"use client";

import { METHOD_TO_DEFAULT_DILUTION } from "@bespoke/domain/recipes/dilution";
import { METHOD_TO_LABEL } from "@bespoke/domain/recipes/labels";
import { collator } from "@bespoke/domain/utils/collator";
import {
	type PreparationMethod,
	preparationMethods,
} from "@bespoke/schema/schema/preparationMethods";
import { type ComponentProps, use, useMemo } from "react";
import { FormatterContext } from "../hooks/useFormatter";
import { Menu } from "../Menu";
import { Select } from "../Select";

type Option = {
	id: PreparationMethod;
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
	const { percentageFormatter } = use(FormatterContext);

	const options = useMemo(
		() =>
			preparationMethods.options
				.map((item) => ({
					id: item,
					value: item,
					label: (
						<Menu.Label
							description={
								METHOD_TO_DEFAULT_DILUTION.has(item)
									? `Default dilution: ${percentageFormatter.format(
											METHOD_TO_DEFAULT_DILUTION.get(item) ?? 0,
										)}`
									: null
							}
						>
							{METHOD_TO_LABEL.get(item) ?? item}
						</Menu.Label>
					),
				}))
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
