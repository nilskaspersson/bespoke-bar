"use client";

import { useTheme } from "next-themes";
import type { ChangeEventHandler } from "react";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

export function ThemePicker() {
	const { setTheme, theme } = useTheme();

	const handleThemeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
		const selectedTheme = event.target.value;
		setTheme(selectedTheme);
	};

	if (!theme) {
		return null;
	}

	return (
		<fieldset className={styles.fieldset}>
			<legend className="sr-only">Choose theme</legend>

			<div
				role="radiogroup"
				aria-label="Theme selection"
				aria-live="polite"
				className={styles.group}
			>
				<label className={styles.label}>
					<input
						type="radio"
						name="theme"
						value="light"
						aria-label="Light mode"
						title="Light mode"
						checked={theme === "light"}
						onChange={handleThemeChange}
						className="sr-only"
					/>
					<Icon name="sun-bright" />
				</label>

				<label className={styles.label}>
					<input
						type="radio"
						name="theme"
						value="dark"
						aria-label="Dark mode"
						title="Dark mode"
						checked={theme === "dark"}
						onChange={handleThemeChange}
						className="sr-only"
					/>
					<Icon name="moon" />
				</label>

				<label className={styles.label}>
					<input
						type="radio"
						name="theme"
						value="system"
						aria-label="Use system setting"
						title="Use system setting"
						checked={theme === "system"}
						onChange={handleThemeChange}
						className="sr-only"
					/>
					<Icon name="display" />
				</label>
			</div>
		</fieldset>
	);
}
