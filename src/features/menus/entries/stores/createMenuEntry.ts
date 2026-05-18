import { create } from "zustand";
import type { RecipeWithSpecs } from "@/db/schema/recipes";

type CreateMenuEntryState = {
	recipe: RecipeWithSpecs | null;
	open: (recipe: RecipeWithSpecs) => void;
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
