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
import {
	usePersistenceInfo,
	WithPersistenceInfo,
} from "@/ui/WithPersistenceInfo";

type AdjustmentValues = {
	servings: number;
	conversionSystem: UnitSystems | null;
	withRounding: boolean;
	withBestUnit: boolean;
};

type RawAdjustments = AdjustmentValues & {
	setServings: (servings: number) => void;
	setConversionSystem: (system: UnitSystems | null) => void;
	setWithRounding: (value: boolean) => void;
	setWithBestUnit: (value: boolean) => void;
};

type DeferredAdjustments = AdjustmentValues;

const RawAdjustmentsContext = createContext<RawAdjustments | null>(null);
const DeferredAdjustmentsContext = createContext<DeferredAdjustments | null>(
	null,
);

/**
 * Owns the "adjustments" state (servings, unit conversion, rounding). Splits
 * into two contexts: raw (instant feedback for the inputs and dock chip) and
 * deferred (cards subscribe here, so rapid input changes don't drag every
 * card through an urgent re-render mid-keystroke).
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
	const deferredConversionSystem = useDeferredValue(conversionSystem);
	const [withRounding, setWithRounding] = useLocalStorage(
		"recipe-with-rounding",
		true,
		"session",
	);
	const deferredWithRounding = useDeferredValue(withRounding);
	const [withBestUnit, setWithBestUnit] = useLocalStorage(
		"recipe-with-best-unit",
		true,
		"session",
	);
	const deferredWithBestUnit = useDeferredValue(withBestUnit);

	const rawValue = useMemo<RawAdjustments>(
		() => ({
			servings,
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
			conversionSystem,
			withRounding,
			withBestUnit,
			setWithRounding,
			setWithBestUnit,
		],
	);

	const deferredValue = useMemo<DeferredAdjustments>(
		() => ({
			servings: deferredServings,
			conversionSystem: deferredConversionSystem,
			withRounding: deferredWithRounding,
			withBestUnit: deferredWithBestUnit,
		}),
		[
			deferredServings,
			deferredConversionSystem,
			deferredWithRounding,
			deferredWithBestUnit,
		],
	);

	return (
		<RawAdjustmentsContext value={rawValue}>
			<DeferredAdjustmentsContext value={deferredValue}>
				{children}
			</DeferredAdjustmentsContext>
		</RawAdjustmentsContext>
	);
}

export function useRawAdjustments(): RawAdjustments {
	const value = use(RawAdjustmentsContext);

	if (!value) {
		throw new Error(
			"useRawAdjustments must be used within a RecipeAdjustmentsProvider",
		);
	}

	return value;
}

export function useDeferredAdjustments(): DeferredAdjustments {
	const value = use(DeferredAdjustmentsContext);

	if (!value) {
		throw new Error(
			"useDeferredAdjustments must be used within a RecipeAdjustmentsProvider",
		);
	}

	return value;
}

export function useOptionalDeferredAdjustments(): DeferredAdjustments | null {
	return use(DeferredAdjustmentsContext);
}

const COMMON_VALUES = [1, 2, 3, 4, 5];

export function RecipeAdjustmentsControls(props: ComponentProps<typeof Grid>) {
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

			<Grid gap={2}>
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
