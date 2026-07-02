"use client";

import type { Menu } from "@bespoke/schema/schema/menus";
import { Button, type ButtonProps } from "@bespoke/ui/Button";
import { useMenuEditor } from "@/features/menus/stores/menuEditor";

export function EditMenuButton({
	menu,
	children,
	onClick,
	...props
}: { menu: Partial<Menu> } & ButtonProps) {
	const open = useMenuEditor((s) => s.open);

	return (
		<Button
			{...props}
			onClick={(event) => {
				onClick?.(event);
				event.stopPropagation();
				open(menu);
			}}
		>
			{children}
		</Button>
	);
}
