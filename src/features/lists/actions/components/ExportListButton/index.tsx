import { useId } from "react";
import type { RecipeListWithEntries } from "@/db/schema/composite";
import { ExportListForm } from "@/features/lists/components/ExportListForm";
import { Button, type ButtonProps } from "@/ui/Button";
import { Drawer } from "@/ui/Drawer";
import { Heading } from "@/ui/Heading";

export function ExportListButton({
	list,
	...props
}: ButtonProps & { list: RecipeListWithEntries }) {
	const dialogId = useId();

	return (
		<>
			<Button
				{...props}
				// @ts-expect-error - commandfor isn't typed yet
				// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/73957
				commandfor={dialogId}
				command="show-modal"
			>
				Export list
			</Button>

			<Drawer id={dialogId} header={<Heading level="h3">Export list</Heading>}>
				<ExportListForm list={list} />
			</Drawer>
		</>
	);
}
