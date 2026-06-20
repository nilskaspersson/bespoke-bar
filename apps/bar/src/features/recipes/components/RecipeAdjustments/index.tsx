"use client";

import { useDeferredValue, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { SelectServings } from "@/features/recipes/components/SelectServings";
import { SelectUnitConversion } from "@/features/recipes/components/SelectUnitConversion";
import {
	type AdjustmentValues,
	recipeAdjustmentsStore,
} from "@/features/recipes/stores/recipeAdjustments";
import { Checkbox } from "@/ui/Checkbox";
import { Grid, type GridProps } from "@/ui/Grid";
import {
	usePersistenceInfo,
	WithPersistenceInfo,
} from "@/ui/WithPersistenceInfo";

export type { AdjustmentValues };

export function useRawAdjustments() {
	return recipeAdjustmentsStore(
		useShallow((s) => ({
			servings: s.servings,
			conversionSystem: s.conversionSystem,
			withRounding: s.withRounding,
			withBestUnit: s.withBestUnit,
			setServings: s.setServings,
			setConversionSystem: s.setConversionSystem,
			setWithRounding: s.setWithRounding,
			setWithBestUnit: s.setWithBestUnit,
		})),
	);
}

/**
 * Read-only adjustments for the cards. `useDeferredValue` yields the cards'
 * re-render to React at lower priority, so editing servings updates the control
 * (which reads `useRawAdjustments`) urgently while the cards catch up when React
 * is idle — the input stays responsive without a manual debounce/throttle.
 * Deferring at the read, not the write: store updates can't be deferred (they're
 * synchronous via `useSyncExternalStore`). `useShallow` keeps the selected object
 * stable so this only defers on real changes.
 */
export function useAdjustments(): AdjustmentValues {
	const values = recipeAdjustmentsStore(
		useShallow((s) => ({
			servings: s.servings,
			conversionSystem: s.conversionSystem,
			withRounding: s.withRounding,
			withBestUnit: s.withBestUnit,
		})),
	);

	return useDeferredValue(values);
}

/**
 * Rehydrates the persisted toggles from sessionStorage after mount, so SSR'd
 * cards render the default first (matching the server) and then sync — rather
 * than mismatching during hydration. Call once per adjustments-bearing surface.
 */
export function useHydrateRecipeAdjustments() {
	useEffect(() => {
		void recipeAdjustmentsStore.persist.rehydrate();
	}, []);
}

const COMMON_VALUES = [1, 2, 3, 4, 5];

export function RecipeAdjustmentsControls(props: GridProps) {
	const {
		servings,
		conversionSystem,
		withRounding,
		withBestUnit,
		setServings,
		setConversionSystem,
		setWithRounding,
		setWithBestUnit,
	} = useRawAdjustments();

	const roundingPersistence = usePersistenceInfo();
	const bestUnitPersistence = usePersistenceInfo();

	return (
		<Grid gap={4} {...props}>
			<SelectServings
				value={servings}
				onChange={setServings}
				commonValues={COMMON_VALUES}
			/>

			<SelectUnitConversion
				name="conversionSystem"
				defaultValue={conversionSystem}
				onChange={setConversionSystem}
			/>

			<Grid gap={2} justifyContent="start" justifyItems="start">
				<WithPersistenceInfo
					persistent="session"
					persistence={roundingPersistence}
				>
					<Checkbox
						label="With rounding"
						size="small"
						checked={withRounding}
						onChange={(e) => {
							setWithRounding(e.target.checked);
							roundingPersistence.notify();
						}}
					/>
				</WithPersistenceInfo>

				<WithPersistenceInfo
					persistent="session"
					persistence={bestUnitPersistence}
				>
					<Checkbox
						label="Convert to best unit"
						size="small"
						checked={withBestUnit}
						onChange={(e) => {
							setWithBestUnit(e.target.checked);
							bestUnitPersistence.notify();
						}}
					/>
				</WithPersistenceInfo>
			</Grid>
		</Grid>
	);
}
