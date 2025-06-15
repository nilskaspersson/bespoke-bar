import configureMeasurements from "convert-units";

import length, {
	type LengthSystems,
	type LengthUnits,
} from "convert-units/definitions/length";

import volume, {
	type VolumeSystems,
	type VolumeUnits,
} from "convert-units/definitions/volume";

type Measures = "length" | "volume";
type Systems = LengthSystems | VolumeSystems;
type Units = LengthUnits | VolumeUnits;

export const convert = configureMeasurements<Measures, Systems, Units>({
	volume,
	length,
});
