import type { EditorThemeClasses } from "lexical";
import styles from "./styles.module.css";

export const EDITOR_THEME: EditorThemeClasses = {
	paragraph: styles.paragraph,
};

export const EXAMPLE_RECIPES: readonly [string, ...string[]] = [
	"Gimlet\n5 cl gin\n3 cl lime juice\n2.5 cl simple syrup",
	"Daiquiri\n2 oz rum\n1 oz lime juice\n3/4 oz simple syrup",
	"Negroni\n3 cl gin\n3 cl campari\n3 cl sweet vermouth",
	"Old Fashioned\n6 cl bourbon\n2 dashes angostura bitters\n1 barspoon simple syrup",
	"Margarita\n4 cl tequila\n2 cl lime juice\n2 cl cointreau",
	"Whiskey Sour\n6 cl bourbon\n3 cl lemon juice\n1.5 cl simple syrup",
];

export const EDITOR_CONFIG = {
	namespace: "RecipeEditor",
	theme: EDITOR_THEME,
	onError: console.error,
	nodes: [],
};
