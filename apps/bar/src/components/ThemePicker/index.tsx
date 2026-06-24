"use client";

import type { IconName } from "@bespoke/ui/icons/types";
import { OptionsSwitch } from "@bespoke/ui/OptionsSwitch";
import { ThemeSchema } from "@bespoke/ui/theme/constants";
import { type ChangeEventHandler, useId } from "react";
import { useTheme } from "@/hooks/useTheme";
import { withKey } from "@/utils/withKey";

const ICONS: Record<(typeof ThemeSchema)["options"][number], IconName> = {
	light: "sun-bright",
	dark: "moon",
	system: "display",
};

const LABELS: Record<(typeof ThemeSchema)["options"][number], string> = {
	light: "Light",
	dark: "Dark",
	system: "System",
};

const THEME_OPTIONS = ThemeSchema.options
	.map((value) => ({
		value,
		label: LABELS[value],
		icon: ICONS[value],
	}))
	.map(withKey);

export function ThemePicker() {
	const { setTheme, theme } = useTheme();
	const name = useId();

	const handleThemeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
		const parsed = ThemeSchema.safeParse(event.target.value);
		if (parsed.success) setTheme(parsed.data);
	};

	return (
		<OptionsSwitch
			name={name}
			options={THEME_OPTIONS}
			legend="Choose theme"
			value={theme}
			onChange={handleThemeChange}
		/>
	);
}
