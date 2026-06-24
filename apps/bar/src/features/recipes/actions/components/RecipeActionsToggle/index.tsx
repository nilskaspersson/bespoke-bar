import { ContextMenu } from "@bespoke/ui/ContextMenu";
import { Heading } from "@bespoke/ui/Heading";
import { HGroup } from "@bespoke/ui/HGroup";
import type { ReactNode } from "react";

type Props = {
	children: ReactNode;
	heading?: ReactNode;
	footer?: ReactNode;
	label?: string;
};

export function RecipeActionsToggle({
	children,
	heading,
	footer,
	label,
}: Props) {
	return (
		<ContextMenu
			label={label}
			heading={
				heading ? (
					<HGroup overline="Recipe actions">
						<Heading level="h4" size={4}>
							{heading}
						</Heading>
					</HGroup>
				) : undefined
			}
			footer={footer}
		>
			{children}
		</ContextMenu>
	);
}
