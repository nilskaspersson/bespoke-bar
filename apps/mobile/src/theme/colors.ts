import type { CocktailStyle } from "@bespoke/schema/schema/cocktailStyles";

type Mode = "light" | "dark";

const mauve = {
	light: {
		1: "#fdfcfd",
		2: "#faf9fb",
		3: "#f2eff3",
		4: "#eae7ec",
		5: "#e3dfe6",
		6: "#dbd8e0",
		7: "#d0cdd7",
		8: "#bcbac7",
		9: "#8e8c99",
		10: "#84828e",
		11: "#65636d",
		12: "#211f26",
	},
	dark: {
		1: "#121113",
		2: "#1a191b",
		3: "#232225",
		4: "#2b292d",
		5: "#323035",
		6: "#3c393f",
		7: "#49474e",
		8: "#625f69",
		9: "#6f6d78",
		10: "#7c7a85",
		11: "#b5b2bc",
		12: "#eeeef0",
	},
} as const satisfies Record<Mode, Record<number, string>>;

const iris = {
	light: { 11: "#5753c6" },
	dark: { 11: "#b1a9ff" },
} as const satisfies Record<Mode, Record<number, string>>;

const red = {
	light: { 9: "#e5484d" },
	dark: { 9: "#e5484d" },
} as const satisfies Record<Mode, Record<number, string>>;

const amber = {
	light: { 11: "#ab6400" },
	dark: { 11: "#ffca16" },
} as const satisfies Record<Mode, Record<number, string>>;

const styleHue = {
	light: {
		aperitif: "#d13415",
		cooler: "#ce2c31",
		digestif: "#ca244d",
		fizz: "#cb1d63",
		flip: "#c2298a",
		highball: "#953ea3",
		julep: "#6550b9",
		manhattan: "#7d5e54",
		martini: "#3a5bc7",
		negroni: "#ab6400",
		oldFashioned: "#0d74ce",
		other: "#00749e",
		punch: "#107d98",
		smash: "#027864",
		sour: "#5c7c2f",
		spritz: "#cc4e00",
		tiki: "#9e6c00",
	},
	dark: {
		aperitif: "#ff977d",
		cooler: "#ff9592",
		digestif: "#ff949d",
		fizz: "#ff92ad",
		flip: "#ff8dcc",
		highball: "#e796f3",
		julep: "#baa7ff",
		manhattan: "#d4b3a5",
		martini: "#9eb1ff",
		negroni: "#ffca16",
		oldFashioned: "#70b8ff",
		other: "#75c7f0",
		punch: "#4ccce6",
		smash: "#58d5ba",
		sour: "#bde56c",
		spritz: "#ffa057",
		tiki: "#f5e147",
	},
} as const satisfies Record<Mode, Record<CocktailStyle, string>>;

function palette(mode: Mode) {
	const scale = mauve[mode];

	return {
		mauve: scale,
		text: scale[11],
		textLight: scale[10],
		textHeavy: scale[12],
		background: scale[3],
		surface: scale[1],
		surfaceRaised: scale[2],
		borderLight: scale[5],
		border: scale[6],
		borderHeavy: scale[7],
		accent: iris[mode][11],
		error: red[mode][9],
		warning: amber[mode][11],
		styleHue: styleHue[mode] as Record<CocktailStyle, string>,
	};
}

export const light = palette("light");
export const dark = palette("dark");
