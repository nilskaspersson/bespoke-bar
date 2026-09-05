import { useColorScheme } from "react-native";
import { dark, light } from "./colors";
import { fonts } from "./fonts";
import { fontSize, radius, space } from "./tokens";

export type Theme = {
	colors: typeof light;
	space: typeof space;
	radius: typeof radius;
	fontSize: typeof fontSize;
	fonts: typeof fonts;
};

export type ResolvedTheme = "light" | "dark";

const themes = {
	light: { colors: light, space, radius, fontSize, fonts },
	dark: { colors: dark, space, radius, fontSize, fonts },
} satisfies Record<ResolvedTheme, Theme>;

/**
 * `useColorScheme()` already reflects the persisted preference, because the
 * preference is applied through `Appearance.setColorScheme` (see
 * theme/preference.ts) — keep this the only file that reads it.
 */
export function useResolvedTheme(): ResolvedTheme {
	return useColorScheme() === "dark" ? "dark" : "light";
}

export function useTheme(): Theme {
	return themes[useResolvedTheme()];
}
