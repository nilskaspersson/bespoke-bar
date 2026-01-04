"use client";

import type { ComponentProps } from "react";
import { OptionsSwitch } from "@/ui/OptionsSwitch";

export type DisplayMode = "PREVIEW" | "EDIT";

type SwitchProps = ComponentProps<typeof OptionsSwitch<DisplayMode>>;

const isDisplayMode = (value: string): value is DisplayMode => {
	return value === "PREVIEW" || value === "EDIT";
};

const OPTIONS: SwitchProps["options"] = [
	{
		id: "EDIT",
		value: "EDIT",
		label: "Edit",
	},
	{
		id: "PREVIEW",
		value: "PREVIEW",
		label: "Preview",
	},
];

export function DisplayModeSwitch({
	onChange,
	...props
}: Omit<SwitchProps, "options" | "onChange"> & {
	onChange: (value: DisplayMode) => void;
}) {
	return (
		<OptionsSwitch<DisplayMode>
			{...props}
			options={OPTIONS}
			onChange={(e) => {
				if (!isDisplayMode(e.target.value)) {
					return;
				}

				onChange(e.target.value);
			}}
		/>
	);
}
