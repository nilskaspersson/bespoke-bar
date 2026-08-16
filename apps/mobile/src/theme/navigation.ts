import { DarkTheme, DefaultTheme } from "expo-router";
import { dark, light } from "./colors";
import type { ResolvedTheme } from "./index";

/**
 * expo-router's vendored react-navigation defaults to the LIGHT DefaultTheme
 * and never adapts it — and its native stack always passes `colors.text` as
 * the header title color, overriding UIKit's adaptive label. Without this
 * provider value the sticky header title stays black in dark mode.
 */
function withPalette(
	base: typeof DefaultTheme,
	colors: typeof light,
): typeof DefaultTheme {
	return {
		...base,
		colors: {
			...base.colors,
			primary: colors.accent,
			background: colors.background,
			card: colors.surface,
			text: colors.textHeavy,
			border: colors.border,
			notification: colors.error,
		},
	};
}

export const navigationThemes: Record<ResolvedTheme, typeof DefaultTheme> = {
	light: withPalette(DefaultTheme, light),
	dark: withPalette(DarkTheme, dark),
};
