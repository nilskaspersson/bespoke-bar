"use client";

import { useTheme } from "next-themes";
import { type ChangeEventHandler, useEffect, useState } from "react";
import { Icon } from "@/ui/Icon";
import type { IconName } from "@/ui/Icon/types";
import styles from "./styles.module.css";

const THEME_OPTIONS = new Map<string, { icon: IconName; label: string }>([
	["light", { icon: "sun-bright", label: "Light mode" }],
	["dark", { icon: "moon", label: "Dark mode" }],
	["system", { icon: "display", label: "Use system setting" }],
]);

export function ThemePicker() {
	const { setTheme, theme } = useTheme();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleThemeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
		const selectedTheme = event.target.value;
		setTheme(selectedTheme);
	};

	return (
		<fieldset className={styles.fieldset}>
			<legend className="sr-only">Choose theme</legend>

			<div
				role="radiogroup"
				aria-label="Theme selection"
				aria-live="polite"
				className={styles.group}
			>
				{Array.from(THEME_OPTIONS.entries(), ([value, { icon, label }]) => (
					<label key={value} className={styles.label}>
						<input
							type="radio"
							name="theme"
							value={value}
							aria-label={label}
							title={label}
							checked={isMounted && theme === value}
							onChange={handleThemeChange}
							disabled={!isMounted}
							className="sr-only"
						/>

						<Icon name={icon} />
					</label>
				))}
			</div>
		</fieldset>
	);
}
