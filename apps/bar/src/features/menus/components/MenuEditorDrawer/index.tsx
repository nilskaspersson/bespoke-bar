"use client";

import { Button } from "@bespoke/ui/Button";
import { Drawer } from "@bespoke/ui/Drawer";
import { Heading } from "@bespoke/ui/Heading";
import { HGroup } from "@bespoke/ui/HGroup";
import { useDialog } from "@bespoke/ui/hooks/useDialog";
import { Kbd } from "@bespoke/ui/Kbd";
import { useEffect, useId } from "react";
import { useShallow } from "zustand/react/shallow";
import { CreateMenuDrawerForm } from "@/features/menus/components/CreateMenuDrawerForm";
import { EditMenuForm } from "@/features/menus/components/EditMenuForm";
import {
	menuEditorStore,
	useMenuEditor,
} from "@/features/menus/stores/menuEditor";

export function MenuEditorDrawer() {
	const formId = useId();
	const { dialogRef, isOpen, mounted, unmount } = useDialog();

	useEffect(() => {
		menuEditorStore.dialogRef = dialogRef;
	}, [dialogRef]);

	const { mode, menu, pending, clear } = useMenuEditor(
		useShallow((s) => ({
			mode: s.mode,
			menu: s.menu,
			pending: s.pending,
			clear: s.clear,
		})),
	);

	const isCreate = mode === "create";

	return (
		<Drawer
			ref={dialogRef}
			isOpen={isOpen}
			mounted={mounted}
			onExitComplete={unmount}
			onClose={clear}
			header={
				<HGroup overline={isCreate ? "New menu" : "Edit menu"} floatingOverline>
					<Heading level="h3" size={6}>
						{isCreate ? "New menu" : (menu?.name ?? "Menu")}
					</Heading>
				</HGroup>
			}
			actions={
				<li>
					<Button
						type="submit"
						form={formId}
						variant="solid"
						color="accent"
						size="small"
						disabled={pending}
						endAdornment={
							<Kbd
								shortcut="mod+enter"
								variant="ghost"
								ignoreInputEvents={false}
							/>
						}
					>
						Save
					</Button>
				</li>
			}
		>
			{isCreate ? (
				<CreateMenuDrawerForm formId={formId} />
			) : menu ? (
				<EditMenuForm formId={formId} menu={menu} />
			) : null}
		</Drawer>
	);
}
