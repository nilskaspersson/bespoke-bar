"use client";

import type { ReactNode } from "react";
import { Kbd } from "@/ui/Kbd";
import { OptionsList } from "@/ui/OptionsList";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

/**
 * Shared menu scaffold for both `IngredientTypeaheadPlugin` (completing a
 * partial query) and `TokenBrowsingPlugin` (click-to-replace on an existing
 * token). `onMouseDown` is suppressed so clicking inside the menu doesn't
 * steal focus from whatever currently has it — the editor for typeahead,
 * the search input for browsing. Firefox in particular blurs focused
 * elements when the user mousedowns on a non-focusable descendant, which
 * without this would tear the popover down mid-click and break commit.
 */
export function IngredientMenu({
	children,
	footerAction,
	header,
}: {
	children: ReactNode;
	footerAction: "complete" | "replace";
	header?: ReactNode;
}) {
	return (
		<OptionsList
			className={styles.typeahead}
			onMouseDown={(e) => e.preventDefault()}
			header={header}
			footer={
				<Text size={1} className={styles.footer}>
					<Kbd shortcut="tab" visual variant="ghost" /> or{" "}
					<Kbd shortcut="enter" visual variant="ghost" /> to {footerAction}
				</Text>
			}
		>
			{children}
		</OptionsList>
	);
}
