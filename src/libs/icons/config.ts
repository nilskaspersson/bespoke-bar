/**
 * Source of truth for the icon sprite. Edit this file to add, rename, or
 * swap icons; then run `npm run icons:build` to regenerate `icons.svg` and
 * `types.ts`.
 *
 * https://icon-sets.iconify.design/lucide/
 */
import type { LucideIconName } from "./kits.types";

type IconSource = { kit: "lucide"; name: LucideIconName } | { local: true };

export const ICONS = {
	"angle-down": { kit: "lucide", name: "chevron-down" },
	"angle-left": { kit: "lucide", name: "chevron-left" },
	"angles-right": { kit: "lucide", name: "chevrons-right" },
	"arrow-down-from-line": { kit: "lucide", name: "arrow-down-from-line" },
	"arrow-down-long": { kit: "lucide", name: "arrow-down" },
	"arrow-down-to-arc": { local: true },
	"arrow-down-to-dotted-line": { local: true },
	"arrow-right": { kit: "lucide", name: "arrow-right" },
	"arrow-rotate-left": { kit: "lucide", name: "rotate-ccw" },
	bars: { kit: "lucide", name: "menu" },
	camera: { kit: "lucide", name: "camera" },
	check: { kit: "lucide", name: "check" },
	"circle-check": { kit: "lucide", name: "circle-check" },
	"circle-exclamation": { kit: "lucide", name: "circle-alert" },
	"circle-info": { kit: "lucide", name: "info" },
	"circle-small": { kit: "lucide", name: "circle-small" },
	"circle-xmark": { kit: "lucide", name: "circle-x" },
	clone: { local: true },
	copy: { kit: "lucide", name: "copy" },
	display: { kit: "lucide", name: "monitor" },
	"duotone-image": { local: true },
	"duotone-input-text": { local: true },
	"duotone-martini-glass": { local: true },
	"duotone-memo-pad": { local: true },
	"duotone-shop": { local: true },
	"duotone-table-tree": { local: true },
	"duotone-wine-bottle": { local: true },
	ellipsis: { kit: "lucide", name: "ellipsis" },
	expand: { kit: "lucide", name: "expand" },
	gear: { kit: "lucide", name: "settings" },
	"glass-citrus": { local: true },
	heart: { local: true },
	"heart-solid": { local: true },
	image: { kit: "lucide", name: "image" },
	"magnifying-glass": { kit: "lucide", name: "search" },
	"martini-glass": { kit: "lucide", name: "martini" },
	memo: { kit: "lucide", name: "file-text" },
	"memo-pad": { kit: "lucide", name: "notebook" },
	minus: { kit: "lucide", name: "minus" },
	moon: { kit: "lucide", name: "moon" },
	pen: { kit: "lucide", name: "pen" },
	"pen-to-square": { kit: "lucide", name: "square-pen" },
	plus: { kit: "lucide", name: "plus" },
	share: { kit: "lucide", name: "share" },
	sort: { kit: "lucide", name: "arrow-down-up" },
	"sort-down": { kit: "lucide", name: "sort-desc" },
	"sort-up": { kit: "lucide", name: "sort-asc" },
	star: { kit: "lucide", name: "star" },
	"sun-bright": { kit: "lucide", name: "sun" },
	"table-list": { kit: "lucide", name: "table" },
	tags: { kit: "lucide", name: "tags" },
	tag: { kit: "lucide", name: "tag" },
	trash: { kit: "lucide", name: "trash-2" },
	"triangle-exclamation": { kit: "lucide", name: "triangle-alert" },
	"wine-glass": { kit: "lucide", name: "wine" },
	xmark: { kit: "lucide", name: "x" },
} as const satisfies Record<string, IconSource>;
