"use client";

import { Button } from "@bespoke/ui/Button";
import type { ComponentProps } from "react";
import { useMenuEditor } from "@/features/menus/stores/menuEditor";

export function CreateMenuButton({
	children,
	onClick,
	...props
}: ComponentProps<typeof Button>) {
	const openCreate = useMenuEditor((s) => s.openCreate);

	return (
		<Button
			{...props}
			onClick={(event) => {
				onClick?.(event);
				openCreate();
			}}
		>
			{children}
		</Button>
	);
}
