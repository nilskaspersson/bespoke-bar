"use client";

import type { MenuWithEntries } from "@bespoke/schema/schema/composite";
import { Button, type ButtonProps } from "@bespoke/ui/Button";
import { Drawer } from "@bespoke/ui/Drawer";
import { Heading } from "@bespoke/ui/Heading";
import { useDialog } from "@bespoke/ui/hooks/useDialog";
import { Icon } from "@bespoke/ui/Icon";
import { Kbd } from "@bespoke/ui/Kbd";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { ExportMenuFormSkeleton } from "@/features/menus/components/ExportMenuForm";

const ExportMenuForm = dynamic(
	() =>
		import("@/features/menus/components/ExportMenuForm").then(
			(m) => m.ExportMenuForm,
		),
	{
		loading: ExportMenuFormSkeleton,
		ssr: false,
	},
);

export function ExportMenuButton({
	menu,
	children,
	...props
}: ButtonProps & { menu: MenuWithEntries }) {
	/**
	 * Note: Wanted to do progressive enhancement with commandfor, but that meant we
	 * always mount the drawer contents, and send subsequent requests to the server.
	 * Had also wanted to use Activity to keep form state, but that unearths an issue
	 * where Radio buttons `defaultValue` is lost when there are Suspense boundaries.
	 */
	const { dialogRef, isOpen, mounted, showModal, unmount } = useDialog();
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<>
			<Button {...props} onClick={showModal}>
				{children}
			</Button>

			<Drawer
				ref={dialogRef}
				isOpen={isOpen}
				mounted={mounted}
				onExitComplete={unmount}
				header={
					<Heading level="h3">
						Export <em>"{menu.name}"</em>
					</Heading>
				}
				actions={
					<li>
						<Button
							variant="solid"
							color="accent"
							size="small"
							onClick={() => formRef.current?.requestSubmit()}
							endAdornment={
								<Kbd
									shortcut="mod+enter"
									variant="ghost"
									ignoreInputEvents={false}
								/>
							}
						>
							<Icon name="arrow-down-from-line" size={1} />
							Export
						</Button>
					</li>
				}
			>
				<ExportMenuForm menu={menu} formRef={formRef} />
			</Drawer>
		</>
	);
}
