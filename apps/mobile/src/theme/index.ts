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

const themes = {
	light: { colors: light, space, radius, fontSize, fonts },
	dark: { colors: dark, space, radius, fontSize, fonts },
} satisfies Record<"light" | "dark", Theme>;

export function useTheme(): Theme {
	return themes[useColorScheme() === "dark" ? "dark" : "light"];
}
