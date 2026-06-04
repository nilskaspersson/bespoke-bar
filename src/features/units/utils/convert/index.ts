import configureMeasurements from "convert-units";
import length, {
	type LengthSystems,
	type LengthUnits,
} from "convert-units/definitions/length";
import volume, {
	type VolumeSystems,
	type VolumeUnits,
} from "@/features/units/constants/volume";

export type UnitMeasures = "length" | "volume";
export type UnitSystems = LengthSystems | VolumeSystems;
export type UnitTypes = LengthUnits | VolumeUnits;

export const convert = configureMeasurements<
	UnitMeasures,
	UnitSystems,
	UnitTypes
>({
	volume,
	length,
});

const factorCache = new Map<string, number>();

/**
 * Cached linear conversion factor between two units. Volume/length conversions
 * are constant ratios, so memoizing the factor reduces the hot per-spec
 * conversion to a multiply, avoiding a `convert-units` Converter allocation on
 * every card render. Only valid for offset-free (linear) measures.
 */
export function convertFactor(from: UnitTypes, to: UnitTypes): number {
	const key = `${from}>${to}`;
	let factor = factorCache.get(key);

	if (factor === undefined) {
		factor = convert(1).from(from).to(to);
		factorCache.set(key, factor);
	}

	return factor;
}

export function isValidUnitSystem(
	unitSystem: unknown,
): unitSystem is UnitSystems {
	return (
		unitSystem === "metric" ||
		unitSystem === "imperial" ||
		unitSystem === "bartending"
	);
}
