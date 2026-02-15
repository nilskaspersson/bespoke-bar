import { create } from "zustand";
import type { Ingredient } from "@/db/schema/ingredients";

export const INGREDIENT_EDITOR_ID = "ingredient-editor";

type IngredientEditorState = {
	ingredient: Partial<Ingredient> | null;
	setIngredient: (ingredient: Partial<Ingredient>) => void;
	clear: () => void;
};

export const useIngredientEditor = create<IngredientEditorState>((set) => ({
	ingredient: null,
	setIngredient: (ingredient) => set({ ingredient }),
	clear: () => set({ ingredient: null }),
}));
