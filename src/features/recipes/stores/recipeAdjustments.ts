import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UnitSystems } from "@/features/units/utils/convert";

export type AdjustmentValues = {
	servings: number;
	conversionSystem: UnitSystems | null;
	withRounding: boolean;
	withBestUnit: boolean;
};

type RecipeAdjustmentsState = AdjustmentValues & {
	setServings: (servings: number) => void;
	setConversionSystem: (system: UnitSystems | null) => void;
	setWithRounding: (value: boolean) => void;
	setWithBestUnit: (value: boolean) => void;
};

/**
 * Shared adjustments (scaling, unit conversion, rounding) applied to recipe
 * cards. The list dock, the card modal and the single-recipe page all read and
 * write this one store, so they stay in sync. Only the two toggles persist (for
 * the session); servings and conversion are intentionally ephemeral. Hydration
 * is deferred to `useHydrateRecipeAdjustments` so SSR'd cards don't mismatch.
 */
export const recipeAdjustmentsStore = create<RecipeAdjustmentsState>()(
	persist(
		(set) => ({
			servings: 1,
			conversionSystem: null,
			withRounding: true,
			withBestUnit: true,
			setServings: (servings) => set({ servings }),
			setConversionSystem: (conversionSystem) => set({ conversionSystem }),
			setWithRounding: (withRounding) => set({ withRounding }),
			setWithBestUnit: (withBestUnit) => set({ withBestUnit }),
		}),
		{
			name: "recipe-adjustments",
			// `skipHydration` keeps storage access client-only (lazy + effect-driven),
			// so this getter never runs during SSR.
			storage: createJSONStorage(() => sessionStorage),
			partialize: ({ withRounding, withBestUnit }) => ({
				withRounding,
				withBestUnit,
			}),
			skipHydration: true,
		},
	),
);

export const useRecipeAdjustments = recipeAdjustmentsStore;
