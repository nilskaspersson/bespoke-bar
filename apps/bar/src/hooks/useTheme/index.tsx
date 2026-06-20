"use client";

import {
	createContext,
	type PropsWithChildren,
	use,
	useEffect,
	useSyncExternalStore,
} from "react";
import {
	type ResolvedTheme,
	THEME_STORAGE_KEY,
	type Theme,
} from "@/app/_theme/constants";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

import { DARK_MODE_MQ } from "@/app/_theme/constants";

function subscribeToDarkMode(onChange: () => void) {
	const controller = new AbortController();
	window
		.matchMedia(DARK_MODE_MQ)
		.addEventListener("change", onChange, { signal: controller.signal });
	return () => controller.abort();
}

function getIsDarkMode() {
	return window.matchMedia(DARK_MODE_MQ).matches;
}

function useSystemPreference(): ResolvedTheme {
	const isDark = useSyncExternalStore(
		subscribeToDarkMode,
		getIsDarkMode,
		() => false,
	);

	return isDark ? "dark" : "light";
}

export function ThemeProvider({ children }: PropsWithChildren) {
	const [theme, setTheme] = useLocalStorage<Theme>(THEME_STORAGE_KEY, "system");
	const systemPreference = useSystemPreference();
	const resolvedTheme: ResolvedTheme =
		theme === "system" ? systemPreference : theme;

	useEffect(() => {
		document.documentElement.dataset.theme = resolvedTheme;
	}, [resolvedTheme]);

	return (
		<ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const context = use(ThemeContext);

	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
}
