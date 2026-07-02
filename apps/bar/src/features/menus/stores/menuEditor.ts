import type { Menu } from "@bespoke/schema/schema/menus";
import { create } from "zustand";

type MenuEditorMode = "create" | "edit";

type MenuEditorState = {
	mode: MenuEditorMode;
	menu: Partial<Menu> | null;
	pending: boolean;
	open: (menu: Partial<Menu>) => void;
	openCreate: () => void;
	setPending: (pending: boolean) => void;
	clear: () => void;
};

export const menuEditorStore = Object.assign(
	create<MenuEditorState>((set) => ({
		mode: "edit",
		menu: null,
		pending: false,
		open: (menu) => {
			set({ mode: "edit", menu });
			menuEditorStore.dialogRef.current?.showModal();
		},
		openCreate: () => {
			set({ mode: "create", menu: null });
			menuEditorStore.dialogRef.current?.showModal();
		},
		setPending: (pending) => set({ pending }),
		clear: () => set({ mode: "edit", menu: null, pending: false }),
	})),
	{
		dialogRef: { current: null } as React.RefObject<HTMLDialogElement | null>,
	},
);

export const useMenuEditor = menuEditorStore;
