"use client";

import { Chip } from "@bespoke/ui/Chip";
import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { use } from "react";
import { Abv } from "@/features/ingredients/components/Abv";

export function AbvChip({ abv }: { abv: number }) {
	const { percentageFormatter } = use(FormatterContext);

	return (
		<Chip color="light" size={1}>
			{percentageFormatter.format(abv)} <Abv />
		</Chip>
	);
}
