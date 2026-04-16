import { create } from "zustand";
import type { RecipeWithSpecs } from "@/db/schema/recipes";

type CreateListEntryState = {
	recipe: RecipeWithSpecs | null;
	open: (recipe: RecipeWithSpecs) => void;
	clear: () => void;
};

export const createListEntryStore = Object.assign(
	create<CreateListEntryState>((set) => ({
		recipe: null,
		open: (recipe) => {
			set({ recipe });
			createListEntryStore.dialogRef.current?.showModal();
		},
		clear: () => set({ recipe: null }),
	})),
	{
		dialogRef: { current: null } as React.RefObject<HTMLDialogElement | null>,
	},
);

export const useCreateListEntry = createListEntryStore;
