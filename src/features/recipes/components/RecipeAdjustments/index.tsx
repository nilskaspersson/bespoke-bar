"use client";

import {
	type ComponentProps,
	createContext,
	type ReactNode,
	use,
	useDeferredValue,
	useMemo,
	useState,
} from "react";
import { SelectServings } from "@/features/recipes/components/SelectServings";
import { SelectUnitConversion } from "@/features/recipes/components/SelectUnitConversion";
import type { UnitSystems } from "@/features/units/utils/convert";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Checkbox } from "@/ui/Checkbox";
import { Grid } from "@/ui/Grid";

type RecipeAdjustmentsValue = {
	servings: number;
	deferredServings: number;
	conversionSystem: UnitSystems | null;
	withRounding: boolean;
	withBestUnit: boolean;
	setServings: (servings: number) => void;
	setConversionSystem: (system: UnitSystems | null) => void;
	setWithRounding: (value: boolean) => void;
	setWithBestUnit: (value: boolean) => void;
};

const RecipeAdjustmentsContext = createContext<RecipeAdjustmentsValue | null>(
	null,
);

/**
 * Owns the "adjustments" state (servings, unit conversion, rounding) for a
 * single recipe view. Wrap the subtree that needs to read or render this
 * state; `useRecipeAdjustments` and `RecipeAdjustmentsControls` resolve
 * against the nearest provider.
 */
export function RecipeAdjustmentsProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [servings, setServings] = useState(1);
	const deferredServings = useDeferredValue(servings);
	const [conversionSystem, setConversionSystem] = useState<UnitSystems | null>(
		null,
	);
	const [withRounding, setWithRounding] = useLocalStorage(
		"recipe-with-rounding",
		true,
		"session",
	);
	const [withBestUnit, setWithBestUnit] = useLocalStorage(
		"recipe-with-best-unit",
		true,
		"session",
	);

	const value = useMemo<RecipeAdjustmentsValue>(
		() => ({
			servings,
			deferredServings,
			conversionSystem,
			withRounding,
			withBestUnit,
			setServings,
			setConversionSystem,
			setWithRounding,
			setWithBestUnit,
		}),
		[
			servings,
			deferredServings,
			conversionSystem,
			withRounding,
			withBestUnit,
			setWithRounding,
			setWithBestUnit,
		],
	);

	return (
		<RecipeAdjustmentsContext value={value}>
			{children}
		</RecipeAdjustmentsContext>
	);
}

export function useRecipeAdjustments(): RecipeAdjustmentsValue {
	const value = use(RecipeAdjustmentsContext);

	if (!value) {
		throw new Error(
			"useRecipeAdjustments must be used within a RecipeAdjustmentsProvider",
		);
	}

	return value;
}

const COMMON_VALUES = [1, 2, 3, 4, 5];

export function RecipeAdjustmentsControls(props: ComponentProps<typeof Grid>) {
	const {
		deferredServings,
		conversionSystem,
		withRounding,
		withBestUnit,
		setServings,
		setConversionSystem,
		setWithRounding,
		setWithBestUnit,
	} = useRecipeAdjustments();

	return (
		<Grid gap={4} {...props}>
			<SelectServings
				value={deferredServings}
				onChange={setServings}
				commonValues={COMMON_VALUES}
			/>

			<SelectUnitConversion
				name="conversionSystem"
				defaultValue={conversionSystem}
				onChange={setConversionSystem}
			/>

			<Grid gap={2}>
				<Checkbox
					label="With rounding"
					size="small"
					checked={withRounding}
					onChange={(e) => setWithRounding(e.target.checked)}
				/>

				<Checkbox
					label="With best unit"
					size="small"
					checked={withBestUnit}
					onChange={(e) => setWithBestUnit(e.target.checked)}
				/>
			</Grid>
		</Grid>
	);
}
