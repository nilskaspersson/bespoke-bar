import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import type {
	Recipe,
	RecipeTagWithTag,
	RecipeWithRelations,
} from "@bespoke/schema/schema/recipes";
import type { Tag } from "@bespoke/schema/schema/tags";
import { create } from "zustand";
import { ingredientEditorStore } from "@/features/ingredients/stores/ingredientEditor";
import { recipeTagsEditorStore } from "@/features/tags/stores/recipeTagsEditor";

type ModalCurrent = {
	recipe: RecipeWithRelations;
	isFavorite: boolean;
	tagOptions: Tag[] | null;
	/**
	 * The source card's rect at click time. Used for animations.
	 */
	sourceRect: DOMRect | null;
};

type RecipeCardModalState = {
	current: ModalCurrent | null;
	exitingId: Recipe["id"] | null;
	open: (
		recipe: RecipeWithRelations,
		isFavorite: boolean,
		tagOptions?: Tag[],
		sourceRect?: DOMRect | null,
	) => void;
	closeWithExit: (recipeId: Recipe["id"]) => void;
	finishExit: (recipeId: Recipe["id"]) => void;
	close: () => void;
	setIsFavorite: (isFavorite: boolean) => void;
	updateIngredient: (updated: Ingredient) => void;
	updateRecipeTags: (recipeId: Recipe["id"], tags: RecipeTagWithTag[]) => void;
};

export const recipeCardModalStore = Object.assign(
	create<RecipeCardModalState>((set, get) => ({
		current: null,
		exitingId: null,
		open: (recipe, isFavorite, tagOptions, sourceRect) => {
			recipeCardModalStore.dialogRef.current?.showModal();
			set({
				current: {
					recipe,
					isFavorite,
					tagOptions: tagOptions ?? null,
					sourceRect: sourceRect ?? null,
				},
			});
		},
		closeWithExit: (recipeId) => {
			set({ current: null, exitingId: recipeId });
		},
		finishExit: (recipeId) => {
			if (get().exitingId === recipeId) set({ exitingId: null });
		},
		close: () => {
			set({ current: null });
		},
		setIsFavorite: (isFavorite) => {
			const { current } = get();
			if (!current) return;
			set({ current: { ...current, isFavorite } });
		},
		updateIngredient: (updated) => {
			const { current } = get();
			if (!current) return;
			set({
				current: {
					...current,
					recipe: {
						...current.recipe,
						lines: current.recipe.lines.map((line) =>
							line.ingredient?.id === updated.id
								? { ...line, ingredient: updated }
								: line,
						),
					},
				},
			});
		},
		updateRecipeTags: (recipeId, tags) => {
			const { current } = get();
			if (!current || current.recipe.id !== recipeId) return;
			set({ current: { ...current, recipe: { ...current.recipe, tags } } });
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
