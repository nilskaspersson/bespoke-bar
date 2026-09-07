export const PREPARATION_METHODS = [
	"blended",
	"built",
	"layered",
	"shaken",
	"stirred",
] as const;

export type PreparationMethod = (typeof PREPARATION_METHODS)[number];
