import { create } from "zustand";
import type { Ingredient } from "@/db/schema/ingredients";
import type {
	Recipe,
	RecipeTagWithTag,
	RecipeWithRelations,
} from "@/db/schema/recipes";
import type { Tag } from "@/db/schema/tags";
import { ingredientEditorStore } from "@/features/ingredients/stores/ingredientEditor";
import { recipeTagsEditorStore } from "@/features/tags/stores/recipeTagsEditor";

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
	setIsFavorite: (isFavorite: boolean) => void;
	updateIngredient: (updated: Ingredient) => void;
	updateRecipeTags: (recipeId: Recipe["id"], tags: RecipeTagWithTag[]) => void;
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
		updateRecipeTags: (recipeId, tags) => {
			const { recipe } = get();
			if (!recipe || recipe.id !== recipeId) return;
			set({ recipe: { ...recipe, tags } });
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

recipeTagsEditorStore.onUpdate(({ recipeId, tags }) => {
	recipeCardModalStore.getState().updateRecipeTags(recipeId, tags);
});
