export const THEME_STORAGE_KEY = "color-theme";
export const DARK_MODE_MQ = "(prefers-color-scheme: dark)";

export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

/** @public */
export const RESOLVED_THEMES = ["light", "dark"] as const;
export type ResolvedTheme = (typeof RESOLVED_THEMES)[number];

export function isTheme(value: string): value is Theme {
	return THEMES.includes(value as Theme);
}
