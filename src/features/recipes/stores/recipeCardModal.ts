import { create } from "zustand";
import type { RecipeWithSpecs } from "@/db/schema/recipes";

type RecipeCardModalState = {
	recipe: RecipeWithSpecs | null;
	isFavorite: boolean;
	mounted: boolean;
	dialogRef: React.RefObject<HTMLDialogElement | null>;
	setRecipe: (recipe: RecipeWithSpecs, isFavorite: boolean) => void;
	clear: () => void;
};

export const recipeCardModalStore = create<RecipeCardModalState>(
	(set, get) => ({
		recipe: null,
		isFavorite: false,
		mounted: false,
		dialogRef: { current: null },
		setRecipe: (recipe, isFavorite) => {
			get().dialogRef.current?.showModal();
			set({ recipe, isFavorite, mounted: true });
		},
		clear: () => set({ recipe: null, isFavorite: false, mounted: false }),
	}),
);

export const useRecipeCardModal = recipeCardModalStore;
