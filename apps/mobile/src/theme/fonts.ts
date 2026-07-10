/**
 * iOS resolves `fontFamily` against a font's internal PostScript name, not its
 * filename — these strings must match `name` table ID 6 in assets/fonts/*.ttf.
 */
export const fonts = {
	serif: "Newsreader-Regular",
	serifSemiBold: "Newsreader-SemiBold",
	serifSemiBoldItalic: "Newsreader-SemiBoldItalic",
} as const;
