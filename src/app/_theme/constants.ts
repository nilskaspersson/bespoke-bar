import { z } from "zod";

export const THEME_STORAGE_KEY = "color-theme";
export const DARK_MODE_MQ = "(prefers-color-scheme: dark)";

export const ThemeSchema = z.enum(["light", "dark", "system"]);
export type Theme = z.infer<typeof ThemeSchema>;

export const ResolvedThemeSchema = z.enum(["light", "dark"]);
export type ResolvedTheme = z.infer<typeof ResolvedThemeSchema>;
