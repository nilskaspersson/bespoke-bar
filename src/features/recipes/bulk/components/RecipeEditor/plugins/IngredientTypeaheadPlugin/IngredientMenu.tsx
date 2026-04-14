"use client";

import type { ReactNode } from "react";
import { Kbd } from "@/ui/Kbd";
import { OptionsList } from "@/ui/OptionsList";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

/**
 * Shared menu scaffold for both `IngredientTypeaheadPlugin` (completing a
 * partial query) and `IngredientBrowsingPlugin` (click-to-replace on an
 * existing token). Identical visuals, only the footer verb differs.
 * `onMouseDown` is suppressed so clicking inside the menu doesn't steal
 * focus from the contenteditable.
 */
export function IngredientMenu({
	children,
	footerAction,
}: {
	children: ReactNode;
	footerAction: "complete" | "replace";
}) {
	return (
		<OptionsList
			className={styles.typeahead}
			onMouseDown={(e) => e.preventDefault()}
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
