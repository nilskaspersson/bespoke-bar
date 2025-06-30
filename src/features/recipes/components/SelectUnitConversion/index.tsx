"use client";

import { type ChangeEvent, useCallback } from "react";
import {
	isValidUnitSystem,
	type UnitSystems,
} from "@/features/units/utils/convert";
import { WeightedToggle } from "@/ui/WeightedToggle";
import { withKey } from "@/utils/withKey";

const OPTIONS = [
	{
		label: "Manual units",
		options: [
			withKey({
				label: "Manual units",
				value: "off",
			}),
		],
	},
	{
		label: "Unit conversion",
		options: [
			{
				value: "metric" satisfies UnitSystems,
				label: "Metric",
			},
			{
				value: "imperial" satisfies UnitSystems,
				label: "Imperial",
			},
		].map(withKey),
	},
].map(withKey);

export function SelectUnitConversion({
	defaultValue,
	onChange,
	name,
}: {
	defaultValue?: UnitSystems | null;
	onChange?: (unitSystem: UnitSystems | null) => void;
	name: string;
}) {
	const handleChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			if (typeof onChange === "function") {
				onChange(
					isValidUnitSystem(event.target.value) ? event.target.value : null,
				);
			}
		},
		[onChange],
	);

	return (
		<WeightedToggle
			name={name}
			defaultValue={defaultValue ?? "off"}
			// legend={<Legend />}
			groups={OPTIONS}
			onChange={handleChange}
		/>
	);
}
