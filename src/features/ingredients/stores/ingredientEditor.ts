import { create } from "zustand";
import type { Ingredient } from "@/db/schema/ingredients";

export const INGREDIENT_EDITOR_ID = "ingredient-editor";

type IngredientEditorState = {
	ingredient: Partial<Ingredient> | null;
	pending: boolean;
	setIngredient: (ingredient: Partial<Ingredient>) => void;
	setPending: (pending: boolean) => void;
	clear: () => void;
};

export const ingredientEditorStore = create<IngredientEditorState>((set) => ({
	ingredient: null,
	pending: false,
	setIngredient: (ingredient) => set({ ingredient }),
	setPending: (pending) => set({ pending }),
	clear: () => set({ ingredient: null, pending: false }),
}));

export const useIngredientEditor = ingredientEditorStore;
