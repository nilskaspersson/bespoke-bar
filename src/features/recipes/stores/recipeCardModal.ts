import { create } from "zustand";
import type { Ingredient } from "@/db/schema/ingredients";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { ingredientEditorStore } from "@/features/ingredients/stores/ingredientEditor";

type RecipeCardModalState = {
	recipe: RecipeWithSpecs | null;
	isFavorite: boolean;
	mounted: boolean;
	setRecipe: (recipe: RecipeWithSpecs, isFavorite: boolean) => void;
	updateIngredient: (updated: Ingredient) => void;
	clear: () => void;
};

export const recipeCardModalStore = Object.assign(
	create<RecipeCardModalState>((set, get) => ({
		recipe: null,
		isFavorite: false,
		mounted: false,
		setRecipe: (recipe, isFavorite) => {
			recipeCardModalStore.dialogRef.current?.showModal();
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
			set({ recipe: null, isFavorite: false, mounted: false });
		},
	})),
	{
		dialogRef: { current: null } as React.RefObject<HTMLDialogElement | null>,
	},
);

export const useRecipeCardModal = recipeCardModalStore;

ingredientEditorStore.onUpdate((updated) => {
	recipeCardModalStore.getState().updateIngredient(updated);
});
