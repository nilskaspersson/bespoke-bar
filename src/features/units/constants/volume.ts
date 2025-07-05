import type { Measure } from "convert-units";

import defaultVolume, {
	type VolumeSystems as DefaultVolumeSystems,
	type VolumeUnits as DefaultVolumeUnits,
} from "convert-units/definitions/volume";

export type BartendingUnits =
	| "dash"
	| "barspoon"
	| "rinse"
	| "drop"
	| "float"
	| "spray";

export type VolumeSystems = DefaultVolumeSystems | "bartending";
export type VolumeUnits = DefaultVolumeUnits | BartendingUnits;

const volume: Measure<VolumeSystems, VolumeUnits> = {
	systems: {
		metric: defaultVolume.systems.metric,
		imperial: defaultVolume.systems.imperial,
		/**
		 * These units are very vague. I may consider allowing users to define their own
		 * eventually. For now, these are my best estimates, based off of the assumption
		 * that a drop is 0.05ml, and articles like this:
		 * https://www.diffordsguide.com/encyclopedia/1177/cocktails/measures-and-measuring
		 */
		bartending: {
			drop: {
				name: { singular: "drop", plural: "drops" },
				to_anchor: 1, // Base unit (0.05ml)
			},
			spray: {
				name: { singular: "spray", plural: "sprays" },
				to_anchor: 2, // 2 drops
			},
			dash: {
				name: { singular: "dash", plural: "dashes" },
				to_anchor: 12, // 12 drops
			},
			rinse: {
				name: { singular: "rinse", plural: "rinses" },
				to_anchor: 40, // 40 drops
			},
			barspoon: {
				name: { singular: "barspoon", plural: "barspoons" },
				to_anchor: 100, // 100 drops
			},
			float: {
				name: { singular: "float", plural: "floats" },
				to_anchor: 150, // 150 drops
			},
		},
	},
	anchors: {
		...defaultVolume.anchors,
		bartending: {
			metric: {
				ratio: 0.00005, // 1 drop = 0.05ml = 0.00005 liters
			},
			imperial: {
				ratio: 0.05 / 29.5735, // = 0.0016907011 (1 drop to fl-oz)
			},
		},
		metric: {
			...defaultVolume.anchors?.metric,
			bartending: {
				ratio: 20000, // 1 liter = 20,000 drops
			},
		},
		imperial: {
			...defaultVolume.anchors?.imperial,
			bartending: {
				ratio: 29.5735 / 0.05, // = 591.47 (1 fl-oz to drops)
			},
		},
	},
};

export default volume;
