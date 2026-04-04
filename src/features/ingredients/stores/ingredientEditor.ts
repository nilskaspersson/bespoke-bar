import { create } from "zustand";
import type { Ingredient } from "@/db/schema/ingredients";

type OnUpdateCallback = (updated: Ingredient) => void;

type IngredientEditorState = {
	ingredient: Partial<Ingredient> | null;
	pending: boolean;
	open: (ingredient: Partial<Ingredient>) => void;
	setIngredient: (ingredient: Partial<Ingredient>) => void;
	setPending: (pending: boolean) => void;
	clear: () => void;
};

const onUpdateListeners = new Set<OnUpdateCallback>();

export const ingredientEditorStore = Object.assign(
	create<IngredientEditorState>((set) => ({
		ingredient: null,
		pending: false,
		open: (ingredient) => {
			set({ ingredient });
			ingredientEditorStore.dialogRef.current?.showModal();
		},
		setIngredient: (ingredient) => set({ ingredient }),
		setPending: (pending) => set({ pending }),
		clear: () => set({ ingredient: null, pending: false }),
	})),
	{
		dialogRef: { current: null } as React.RefObject<HTMLDialogElement | null>,
		emitUpdate: (updated: Ingredient) => {
			for (const listener of onUpdateListeners) {
				listener(updated);
			}
		},
		onUpdate: (callback: OnUpdateCallback) => {
			onUpdateListeners.add(callback);
			return () => {
				onUpdateListeners.delete(callback);
			};
		},
	},
);

export const useIngredientEditor = ingredientEditorStore;
