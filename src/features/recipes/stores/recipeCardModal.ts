import { create } from "zustand";
import type { RecipeWithSpecs } from "@/db/schema/recipes";

type RecipeCardModalState = {
	recipe: RecipeWithSpecs | null;
	isFavorite: boolean;
	mounted: boolean;
	setRecipe: (recipe: RecipeWithSpecs, isFavorite: boolean) => void;
	setMounted: (mounted: boolean) => void;
	clear: () => void;
};

export const recipeCardModalStore = create<RecipeCardModalState>((set) => ({
	recipe: null,
	isFavorite: false,
	mounted: false,
	setRecipe: (recipe, isFavorite) => set({ recipe, isFavorite }),
	setMounted: (mounted) => set({ mounted }),
	clear: () => set({ recipe: null, isFavorite: false, mounted: false }),
}));

export const useRecipeCardModal = recipeCardModalStore;
