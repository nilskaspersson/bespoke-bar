import type { ReactNode } from "react";
import { ContextMenu } from "@/ui/ContextMenu";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";

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
