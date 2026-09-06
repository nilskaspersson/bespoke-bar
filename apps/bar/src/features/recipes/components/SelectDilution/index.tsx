"use client";

import { SelectDilution as DilutionRange } from "@bespoke/ui/SelectDilution";
import { useField } from "@conform-to/react";

export function SelectDilution({
	name,
	defaultValue,
}: {
	name: string;
	defaultValue?: string;
}) {
	const [field] = useField<string>(name);

	return (
		<DilutionRange
			name={name}
			id={field.id}
			required={field.required}
			defaultValue={Number(defaultValue ?? 0)}
		/>
	);
}
