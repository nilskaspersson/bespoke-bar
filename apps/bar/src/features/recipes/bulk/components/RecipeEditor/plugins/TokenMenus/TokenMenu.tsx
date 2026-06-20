"use client";

import type { ComponentProps, ReactNode } from "react";
import { Kbd } from "@/ui/Kbd";
import { Menu } from "@/ui/Menu";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

type Props = Omit<ComponentProps<typeof Menu>, "footer" | "children"> & {
	children: ReactNode;
	footerAction: "complete" | "replace";
};

/**
 * Shared menu scaffold for the ingredient and unit typeaheads (completing
 * a partial query) and `TokenBrowsingPlugin` (click-to-replace on an
 * existing token). `onMouseDown` is suppressed so clicking inside the
 * menu doesn't steal focus from whatever currently has it — the editor
 * for typeahead, the search input for browsing. Firefox in particular
 * blurs focused elements when the user mousedowns on a non-focusable
 * descendant, which without this would tear the popover down mid-click
 * and break commit.
 */
export function TokenMenu({ children, footerAction, ...menuProps }: Props) {
	return (
		<Menu
			{...menuProps}
			onMouseDown={(e) => e.preventDefault()}
			style={{ width: "var(--control-width)" }}
			footer={
				<Text size={1} className={styles.footer}>
					<Kbd shortcut="tab" visual variant="ghost" /> or{" "}
					<Kbd shortcut="enter" visual variant="ghost" /> to {footerAction}
				</Text>
			}
		>
			{children}
		</Menu>
	);
}
