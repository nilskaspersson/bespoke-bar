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

export function isValidUnitSystem(
	unitSystem: unknown,
): unitSystem is UnitSystems {
	return (
		unitSystem === "metric" ||
		unitSystem === "imperial" ||
		unitSystem === "bartending"
	);
}
