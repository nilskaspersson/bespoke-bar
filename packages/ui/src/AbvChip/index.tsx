"use client";

import { use } from "react";
import { Abv } from "../Abv";
import { Chip } from "../Chip";
import { FormatterContext } from "../hooks/useFormatter";

export function AbvChip({ abv }: { abv: number }) {
	const { percentageFormatter } = use(FormatterContext);

	return (
		<Chip color="light" size={1}>
			{percentageFormatter.format(abv)} <Abv />
		</Chip>
	);
}
