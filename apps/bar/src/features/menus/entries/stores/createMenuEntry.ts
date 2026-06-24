import type { RecipeWithLines } from "@bespoke/schema/schema/recipes";
import { create } from "zustand";

type CreateMenuEntryState = {
	recipe: RecipeWithLines | null;
	open: (recipe: RecipeWithLines) => void;
	clear: () => void;
};

export const createMenuEntryStore = Object.assign(
	create<CreateMenuEntryState>((set) => ({
		recipe: null,
		open: (recipe) => {
			set({ recipe });
			createMenuEntryStore.dialogRef.current?.showModal();
		},
		clear: () => set({ recipe: null }),
	})),
	{
		dialogRef: { current: null } as React.RefObject<HTMLDialogElement | null>,
	},
);

export const useCreateMenuEntry = createMenuEntryStore;
