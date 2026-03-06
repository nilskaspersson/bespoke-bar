import { create } from "zustand";
import type { Ingredient } from "@/db/schema/ingredients";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { ingredientEditorStore } from "@/features/ingredients/stores/ingredientEditor";

type RecipeCardModalState = {
	recipe: RecipeWithSpecs | null;
	isFavorite: boolean;
	mounted: boolean;
	dialogRef: React.RefObject<HTMLDialogElement | null>;
	setRecipe: (recipe: RecipeWithSpecs, isFavorite: boolean) => void;
	updateIngredient: (updated: Ingredient) => void;
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
		updateIngredient: (updated) => {
			const { recipe } = get();
			if (!recipe) return;
			set({
				recipe: {
					...recipe,
					specs: recipe.specs.map((spec) =>
						spec.ingredient?.id === updated.id
							? { ...spec, ingredient: updated }
							: spec,
					),
				},
			});
		},
		clear: () => {
			get().dialogRef.current?.close();
			set({ recipe: null, isFavorite: false, mounted: false });
		},
	}),
);

export const useRecipeCardModal = recipeCardModalStore;

ingredientEditorStore.onUpdate((updated) => {
	recipeCardModalStore.getState().updateIngredient(updated);
});
