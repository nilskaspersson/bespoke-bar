import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { create } from "zustand";

type OnUpdateCallback = (updated: Ingredient) => void;

type IngredientEditorMode = "create" | "edit";

type IngredientEditorState = {
	mode: IngredientEditorMode;
	ingredient: Partial<Ingredient> | null;
	pending: boolean;
	open: (ingredient: Partial<Ingredient>) => void;
	openCreate: () => void;
	setIngredient: (ingredient: Partial<Ingredient>) => void;
	setPending: (pending: boolean) => void;
	clear: () => void;
};

const onUpdateListeners = new Set<OnUpdateCallback>();

export const ingredientEditorStore = Object.assign(
	create<IngredientEditorState>((set) => ({
		mode: "edit",
		ingredient: null,
		pending: false,
		open: (ingredient) => {
			set({ mode: "edit", ingredient });
			ingredientEditorStore.dialogRef.current?.showModal();
		},
		openCreate: () => {
			set({ mode: "create", ingredient: null });
			ingredientEditorStore.dialogRef.current?.showModal();
		},
		setIngredient: (ingredient) => set({ ingredient }),
		setPending: (pending) => set({ pending }),
		clear: () => set({ mode: "edit", ingredient: null, pending: false }),
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
