"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import type { RecipeListWithEntries } from "@/db/schema/composite";
import { ExportListFormSkeleton } from "@/features/lists/components/ExportListForm";
import { useDialog } from "@/hooks/useDialog";
import { Button, type ButtonProps } from "@/ui/Button";
import { Drawer } from "@/ui/Drawer";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";

const ExportListForm = dynamic(
	() =>
		import("@/features/lists/components/ExportListForm").then(
			(m) => m.ExportListForm,
		),
	{
		loading: ExportListFormSkeleton,
		ssr: false,
	},
);

export function ExportListButton({
	list,
	children,
	...props
}: ButtonProps & { list: RecipeListWithEntries }) {
	/**
	 * Note: Wanted to do progressive enhancement with commandfor, but that meant we
	 * always mount the drawer contents, and send subsequent requests to the server.
	 * Had also wanted to use Activity to keep form state, but that unearths an issue
	 * where Radio buttons `defaultValue` is lost when there are Suspense boundaries.
	 */
	const { openDialog, onClose, dialogRef, isOpen } = useDialog();
	const formRef = useRef<HTMLFormElement>(null);

	const handleExport = () => {
		formRef.current?.requestSubmit();
	};

	return (
		<>
			<Button {...props} onClick={openDialog}>
				{children}
			</Button>

			<Drawer
				ref={dialogRef}
				onClose={onClose}
				header={
					<Heading level="h3">
						Export <em>"{list.name}"</em>
					</Heading>
				}
				actions={
					<li>
						<Button
							variant="solid"
							color="accent"
							size="small"
							onClick={handleExport}
						>
							<Icon name="arrow-down-from-line" size={1} />
							Export
						</Button>
					</li>
				}
			>
				{isOpen ? <ExportListForm list={list} formRef={formRef} /> : null}
			</Drawer>
		</>
	);
}
