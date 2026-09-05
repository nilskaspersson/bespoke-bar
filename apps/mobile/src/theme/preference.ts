import { Appearance } from "react-native";
import { createMMKV } from "react-native-mmkv";
import { z } from "zod";
import { create } from "zustand";

/**
 * The web app's three-way theme preference (packages/ui theme/constants.ts),
 * hand-mirrored per ADR-0014 — mobile must not import @bespoke/ui. The
 * preference survives sign-out, so it lives in its own MMKV instance rather
 * than the purgeable query-cache or session-scoped offline-auth stores.
 */
const themePreferenceSchema = z.enum(["light", "dark", "system"]);
export type ThemePreference = z.infer<typeof themePreferenceSchema>;

const THEME_KEY = "color-theme";

const settingsStorage = createMMKV({ id: "settings" });

function readStoredPreference(): ThemePreference {
	const parsed = themePreferenceSchema.safeParse(
		settingsStorage.getString(THEME_KEY),
	);
	return parsed.success ? parsed.data : "system";
}

/**
 * Appearance.setColorScheme is the whole override mechanism: on iOS it sets
 * `overrideUserInterfaceStyle` on every window, so native chrome (headers,
 * search bar, alerts, Clerk's SwiftUI AuthView) and `useColorScheme()` all
 * follow together. "system" maps to "unspecified", which releases the override
 * and resumes live OS tracking.
 */
function applyPreference(preference: ThemePreference): void {
	Appearance.setColorScheme(
		preference === "system" ? "unspecified" : preference,
	);
}

type ThemePreferenceState = {
	preference: ThemePreference;
	setPreference: (preference: ThemePreference) => void;
};

export const useThemePreference = create<ThemePreferenceState>((set) => ({
	preference: readStoredPreference(),
	setPreference: (preference) => {
		settingsStorage.set(THEME_KEY, preference);
		applyPreference(preference);
		set({ preference });
	},
}));

/**
 * Applied at module scope — MMKV reads synchronously, so importing this module
 * from the root layout restores the persisted override before the first frame.
 */
applyPreference(useThemePreference.getState().preference);
