"use client";

import type { ReactNode } from "react";
import { usePopover } from "@/hooks/usePopover";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { Popover } from "@/ui/Popover";
import { stopPropagation } from "@/utils/events";
import styles from "./styles.module.css";

type Props = {
	children: ReactNode;
};

export function RecipeActionsToggle({ children }: Props) {
	const popover = usePopover();

	return (
		<>
			<Button
				variant="ghost"
				size="tiny"
				color="light"
				icon
				aria-label="Recipe actions"
				{...popover.triggerProps}
				onClick={stopPropagation}
			>
				<Icon name="ellipsis" size={2} />
			</Button>

			<Popover
				{...popover.contentProps}
				position="bottom-right"
				className={styles.popover}
			>
				{children}
			</Popover>
		</>
	);
}
