"use client";

import type { ChangeEventHandler } from "react";
import { ThemeSchema } from "@/app/_theme/constants";
import { useTheme } from "@/hooks/useTheme";
import type { IconName } from "@/ui/Icon/types";
import { OptionsSwitch } from "@/ui/OptionsSwitch";
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

	const handleThemeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
		const parsed = ThemeSchema.safeParse(event.target.value);
		if (parsed.success) setTheme(parsed.data);
	};

	return (
		<OptionsSwitch
			name="theme"
			options={THEME_OPTIONS}
			legend="Choose theme"
			value={theme}
			onChange={handleThemeChange}
		/>
	);
}
