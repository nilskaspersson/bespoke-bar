"use client";

import { withKey } from "@bespoke/domain/utils/withKey";
import { type ChangeEventHandler, useId } from "react";
import type { IconName } from "../icons/types";
import { OptionsSwitch } from "../OptionsSwitch";
import { isTheme, THEMES, type Theme } from "../theme/constants";
import { useTheme } from "../theme/ThemeProvider";

const ICONS: Record<Theme, IconName> = {
	light: "sun-bright",
	dark: "moon",
	system: "display",
};

const LABELS: Record<Theme, string> = {
	light: "Light",
	dark: "Dark",
	system: "System",
};

const THEME_OPTIONS = THEMES.map((value) => ({
	value,
	label: LABELS[value],
	icon: ICONS[value],
})).map(withKey);

export function ThemePicker() {
	const { setTheme, theme } = useTheme();
	const name = useId();

	const handleThemeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
		const value = event.target.value;
		if (isTheme(value)) setTheme(value);
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
