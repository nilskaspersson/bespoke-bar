import { create } from "zustand";
import type { Ingredient } from "@/db/schema/ingredients";
import type { RecipeWithRelations } from "@/db/schema/recipes";
import type { Tag } from "@/db/schema/tags";
import { ingredientEditorStore } from "@/features/ingredients/stores/ingredientEditor";

type RecipeCardModalState = {
	recipe: RecipeWithRelations | null;
	isFavorite: boolean;
	tagOptions: Tag[] | null;
	mounted: boolean;
	setRecipe: (
		recipe: RecipeWithRelations,
		isFavorite: boolean,
		tagOptions?: Tag[],
	) => void;
	syncRecipe: (recipe: RecipeWithRelations, tagOptions?: Tag[]) => void;
	setIsFavorite: (isFavorite: boolean) => void;
	updateIngredient: (updated: Ingredient) => void;
	clear: () => void;
};

export const recipeCardModalStore = Object.assign(
	create<RecipeCardModalState>((set, get) => ({
		recipe: null,
		isFavorite: false,
		tagOptions: null,
		mounted: false,
		setRecipe: (recipe, isFavorite, tagOptions) => {
			recipeCardModalStore.dialogRef.current?.showModal();
			set({
				recipe,
				isFavorite,
				tagOptions: tagOptions ?? null,
				mounted: true,
			});
		},
		/** Write-through update; skips dialog/mounted side-effects of setRecipe. */
		syncRecipe: (recipe, tagOptions) => {
			set((prev) => ({
				recipe,
				tagOptions: tagOptions ?? prev.tagOptions,
			}));
		},
		setIsFavorite: (isFavorite) => {
			set({ isFavorite });
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
			set({
				recipe: null,
				isFavorite: false,
				tagOptions: null,
				mounted: false,
			});
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
