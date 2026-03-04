import { create } from "zustand";
import type { Ingredient } from "@/db/schema/ingredients";

export const INGREDIENT_EDITOR_ID = "ingredient-editor";

type OnUpdateCallback = (updated: Ingredient) => void;

type IngredientEditorState = {
	ingredient: Partial<Ingredient> | null;
	pending: boolean;
	setIngredient: (ingredient: Partial<Ingredient>) => void;
	setPending: (pending: boolean) => void;
	clear: () => void;
};

const onUpdateListeners = new Set<OnUpdateCallback>();

export const ingredientEditorStore = Object.assign(
	create<IngredientEditorState>((set) => ({
		ingredient: null,
		pending: false,
		setIngredient: (ingredient) => set({ ingredient }),
		setPending: (pending) => set({ pending }),
		clear: () => set({ ingredient: null, pending: false }),
	})),
	{
		emitUpdate: (updated: Ingredient) => {
			for (const listener of onUpdateListeners) {
				listener(updated);
			}
		},
		onUpdate: (callback: OnUpdateCallback) => {
			onUpdateListeners.add(callback);
			return () => {
				onUpdateListeners.delete(callback);
			};
		},
	},
);

export const useIngredientEditor = ingredientEditorStore;
