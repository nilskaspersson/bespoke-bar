"use client";

import { createContext, type ReactNode, use } from "react";
import { type UsePopoverReturn, usePopover } from "@/hooks/usePopover";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { Popover } from "@/ui/Popover";
import { stopPropagation } from "@/utils/events";
import styles from "./styles.module.css";

const ContextMenuContext = createContext<UsePopoverReturn | null>(null);

export function useContextMenu() {
	const ctx = use(ContextMenuContext);
	if (!ctx) throw new Error("useContextMenu must be used within a ContextMenu");
	return ctx;
}

type Props = {
	children: ReactNode;
	heading?: ReactNode;
	footer?: ReactNode;
	label?: string;
};

export function ContextMenu({ children, heading, footer, label }: Props) {
	const popover = usePopover();

	return (
		<>
			<Button
				variant="ghost"
				size="tiny"
				color="light"
				icon
				aria-label={label ?? "Actions"}
				{...popover.triggerProps}
				onClick={stopPropagation}
				onKeyDown={stopPropagation}
				className={popover.isOpen ? styles.open : undefined}
			>
				<Icon name="ellipsis" size={2} />
			</Button>

			<Popover
				{...popover.contentProps}
				position="top-right"
				className={styles.popover}
				role="menu"
				aria-label={label}
			>
				{heading ? <header className={styles.heading}>{heading}</header> : null}
				<ContextMenuContext value={popover}>{children}</ContextMenuContext>
				{footer ? <footer className={styles.footer}>{footer}</footer> : null}
			</Popover>
		</>
	);
}
