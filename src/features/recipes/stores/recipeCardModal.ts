import { create } from "zustand";
import type { RecipeWithSpecs } from "@/db/schema/recipes";

type RecipeCardModalState = {
	recipe: RecipeWithSpecs | null;
	isFavorite: boolean;
	setRecipe: (recipe: RecipeWithSpecs, isFavorite: boolean) => void;
	clear: () => void;
};

export const recipeCardModalStore = create<RecipeCardModalState>((set) => ({
	recipe: null,
	isFavorite: false,
	setRecipe: (recipe, isFavorite) => set({ recipe, isFavorite }),
	clear: () => set({ recipe: null, isFavorite: false }),
}));

export const useRecipeCardModal = recipeCardModalStore;
