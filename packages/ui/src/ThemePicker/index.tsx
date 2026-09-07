"use client";

import { withKey } from "@bespoke/domain/utils/withKey";
import { type ChangeEventHandler, useId } from "react";
import type { IconName } from "../icons/types";
import { OptionsSwitch } from "../OptionsSwitch";
<<<<<<< HEAD
import { isTheme, THEMES, type Theme } from "../theme/constants";
import { useTheme } from "../theme/ThemeProvider";

const ICONS: Record<Theme, IconName> = {
=======
import { ThemeSchema } from "../theme/constants";
import { useTheme } from "../theme/ThemeProvider";

const ICONS: Record<(typeof ThemeSchema)["options"][number], IconName> = {
>>>>>>> main
	light: "sun-bright",
	dark: "moon",
	system: "display",
};

<<<<<<< HEAD
const LABELS: Record<Theme, string> = {
=======
const LABELS: Record<(typeof ThemeSchema)["options"][number], string> = {
>>>>>>> main
	light: "Light",
	dark: "Dark",
	system: "System",
};

<<<<<<< HEAD
const THEME_OPTIONS = THEMES.map((value) => ({
	value,
	label: LABELS[value],
	icon: ICONS[value],
})).map(withKey);
=======
const THEME_OPTIONS = ThemeSchema.options
	.map((value) => ({
		value,
		label: LABELS[value],
		icon: ICONS[value],
	}))
	.map(withKey);
>>>>>>> main

export function ThemePicker() {
	const { setTheme, theme } = useTheme();
	const name = useId();

	const handleThemeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
<<<<<<< HEAD
		const value = event.target.value;
		if (isTheme(value)) setTheme(value);
=======
		const parsed = ThemeSchema.safeParse(event.target.value);
		if (parsed.success) setTheme(parsed.data);
>>>>>>> main
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
