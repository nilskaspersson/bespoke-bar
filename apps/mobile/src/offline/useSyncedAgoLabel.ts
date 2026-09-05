import { useFormatters } from "@/formatters";

const UNITS = [
	{ unit: "day", ms: 1000 * 60 * 60 * 24 },
	{ unit: "hour", ms: 1000 * 60 * 60 },
	{ unit: "minute", ms: 1000 * 60 },
	{ unit: "second", ms: 1000 },
] as const satisfies readonly {
	unit: Intl.RelativeTimeFormatUnit;
	ms: number;
}[];

function relativeParts(
	elapsedMs: number,
): [number, Intl.RelativeTimeFormatUnit] {
	for (const { unit, ms } of UNITS) {
		if (elapsedMs >= ms) {
			return [-Math.floor(elapsedMs / ms), unit];
		}
	}
	return [0, "second"];
}

export function useSyncedAgoLabel(dataUpdatedAt: number): string | undefined {
	const { relativeTime } = useFormatters();

	if (dataUpdatedAt === 0) {
		return undefined;
	}

	const [value, unit] = relativeParts(Date.now() - dataUpdatedAt);
	return `Synced ${relativeTime.format(value, unit)}`;
}
