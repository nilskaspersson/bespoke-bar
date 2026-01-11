"use client";

import { useTheme } from "next-themes";
import type { ChangeEventHandler } from "react";
import { useIsMounted } from "@/hooks/useIsMounted";
import type { IconName } from "@/ui/Icon/types";
import { OptionsSwitch } from "@/ui/OptionsSwitch";
import { withKey } from "@/utils/withKey";

const THEME_OPTIONS = (
	[
		{
			value: "light",
			label: "Light",
			icon: "sun-bright" satisfies IconName,
		},
		{ value: "dark", label: "Dark", icon: "moon" satisfies IconName },
		{
			value: "system",
			label: "System",
			icon: "display" satisfies IconName,
		},
	] as const
).map(withKey);

export function ThemePicker() {
	const { setTheme, theme } = useTheme();
	const isMounted = useIsMounted();

	const handleThemeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
		const selectedTheme = event.target.value;
		setTheme(selectedTheme);
	};

	return (
		<OptionsSwitch
			name="theme"
			options={THEME_OPTIONS}
			legend="Choose theme"
			value={theme}
			disabled={!isMounted}
			onChange={handleThemeChange}
		/>
	);
}
