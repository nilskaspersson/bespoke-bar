"use client";

import { clsx } from "clsx";
import type { ComponentProps, ToggleEventHandler } from "react";
import type { PopoverType } from "@/hooks/usePopover";

import { stopPropagation } from "@/utils/events";
import { mergeStyleSources, toCSSVars } from "@/utils/styles";
import styles from "./styles.module.css";

type AnchorPosition = "top" | "top-right" | "bottom-start";

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
	/**
	 * Opt out of the small-screen modal fallback (centered popover with
	 * `::backdrop` blur). Use for popovers that float over an active
	 * input the user is still typing into — modal treatment hijacks the
	 * screen mid-interaction.
	 */
	keepAnchored?: boolean;
	/**
	 * Skip the `@starting-style` entry animation. Intended for popovers
	 * that are unmounted and remounted programmatically within a single
	 * user session (e.g. a Lexical typeahead tears its menu down on
	 * every keystroke). Replaying the animation per keystroke reads as
	 * visual jitter; set `true` on remounts, `false` on first open.
	 */
	suppressEntryAnimation?: boolean;
};

export function Popover({
	anchorId,
	children,
	className,
	position = "top",
	style,
	isOpen,
	keepAnchored,
	suppressEntryAnimation,
	...props
}: Props) {
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: top-layer element; prevents keyboard/click events from leaking to elements beneath the popover
		<div
			className={clsx(className, styles.popover, styles[position], {
				[styles.keepAnchored]: keepAnchored,
				[styles.suppressEntryAnimation]: suppressEntryAnimation,
			})}
			style={mergeStyleSources(style, { positionAnchor: `--${anchorId}` })}
			onKeyDown={stopPropagation}
			onClick={stopPropagation}
			{...props}
		>
			{isOpen ? children : null}
		</div>
	);
}

/**
 * Invisible fixed-position element that acts as a CSS anchor for a
 * popover. Use when the "trigger" is a position rather than a DOM
 * element — e.g. the clicked token's location in the recipe editor's
 * browse plugin. For element-based anchoring, apply `anchor-name` to
 * the trigger element directly via `style`.
 *
 * Height is always zero — `-start`/`-end` popover variants align to the
 * anchor's outer edge, so a point-shaped anchor lands the menu exactly
 * at `(left, top)`.
 */
export function PopoverAnchor({
	top,
	left,
	width = 0,
	anchorName,
}: {
	top: number;
	left: number;
	width?: number;
	anchorName: string;
}) {
	return (
		<div
			aria-hidden
			className={styles.anchor}
			style={toCSSVars({
				anchorTop: `${top}px`,
				anchorLeft: `${left}px`,
				anchorWidth: `${width}px`,
				anchorName,
			})}
		/>
	);
}
