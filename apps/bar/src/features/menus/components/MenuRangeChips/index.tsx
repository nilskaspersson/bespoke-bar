"use client";

import { Abv } from "@bespoke/ui/Abv";
import { Chip } from "@bespoke/ui/Chip";
import { Flex, type FlexProps } from "@bespoke/ui/Flex";
import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { use } from "react";
import type { MenuComposition } from "@/features/menus/utils/menuComposition";

function formatRange(
	range: [number, number] | null,
	format: (value: number) => string,
): string {
	if (!range) {
		return "–";
	}

	const [min, max] = range;
	return min === max ? format(min) : `${format(min)}–${format(max)}`;
}

export function MenuRangeChips({
	abvRange,
	priceRange,
	...props
}: Pick<MenuComposition, "abvRange" | "priceRange"> &
	Omit<FlexProps, "children">) {
	const { currencyFormatter, percentageFormatter } = use(FormatterContext);

	return (
		<Flex gap={2} wrap justifyContent="center" {...props}>
			<Chip label={<Abv />} color="light">
				{formatRange(abvRange, (value) => percentageFormatter.format(value))}
			</Chip>

			<Chip label="Price" color="light">
				{formatRange(priceRange, (value) => currencyFormatter.format(value))}
			</Chip>
		</Flex>
	);
}
