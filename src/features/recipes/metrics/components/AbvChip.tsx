"use client";

import { use } from "react";
import { Abv } from "@/features/ingredients/components/Abv";
import { FormatterContext } from "@/hooks/useFormatter";
import { Chip } from "@/ui/Chip";

export function AbvChip({ abv }: { abv: number }) {
	const { percentageFormatter } = use(FormatterContext);

	return (
		<Chip color="light" size={1}>
			{percentageFormatter.format(abv)} <Abv />
		</Chip>
	);
}
