"use client";

import { clsx } from "clsx";
import type { ComponentProps, ToggleEventHandler } from "react";
import { ViewTransition } from "react";
import type { PopoverType } from "@/hooks/usePopover";

import { stopEscapePropagation } from "@/utils/events";
import { mergeStyleSources } from "@/utils/styles";
import styles from "./styles.module.css";

type AnchorPosition =
	| "top"
	| "top-left"
	| "top-right"
	| "bottom"
	| "bottom-left"
	| "bottom-right"
	| "left"
	| "right";

type Props = ComponentProps<"div"> & {
	/**
	 * ID for `popovertarget`
	 */
	id: string;
	/**
	 * ID of the anchor element
	 */
	anchorId: string;
	/**
	 * Preferred position relative to the anchor.
	 * Falls back to opposite side if not enough space.
	 * @default "top"
	 */
	position?: AnchorPosition;
	onToggle?: ToggleEventHandler<HTMLDivElement>;
	popover: PopoverType;
	isOpen: boolean;
};

export function Popover({
	anchorId,
	children,
	className,
	position = "top",
	style,
	isOpen,
	...props
}: Props) {
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: prevents Escape from bubbling to parent dialogs
		<div
			className={clsx(styles.popover, styles[position], className)}
			style={mergeStyleSources(style, { positionAnchor: `--${anchorId}` })}
			onKeyDown={stopEscapePropagation}
			{...props}
		>
			{isOpen ? (
				<ViewTransition exit={styles["popover-exit"]}>
					{children}
				</ViewTransition>
			) : null}
		</div>
	);
}
