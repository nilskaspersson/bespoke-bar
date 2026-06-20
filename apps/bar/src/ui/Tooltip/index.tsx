"use client";

import {
	type CSSProperties,
	createElement,
	type ElementType,
	type FocusEvent,
	type KeyboardEvent,
	type MouseEvent,
	type PointerEvent,
	type ReactNode,
} from "react";
import { usePopover } from "@/hooks/usePopover";
import { BarePopover } from "@/ui/Popover";
import { Text } from "@/ui/Text";
import type { PolymorphicProps } from "@/utils/types";
import styles from "./styles.module.css";

export type TooltipProps<E extends ElementType = "span"> =
	PolymorphicProps<E> & {
		content: ReactNode;
		as?: E;
	};

type Composed = {
	style?: CSSProperties;
	tabIndex?: number;
	onPointerEnter?: (e: PointerEvent) => void;
	onPointerLeave?: (e: PointerEvent) => void;
	onFocus?: (e: FocusEvent) => void;
	onBlur?: (e: FocusEvent) => void;
	onClick?: (e: MouseEvent) => void;
	onKeyDown?: (e: KeyboardEvent) => void;
};

/**
 * Anchors a hover/focus hint to its trigger and owns the trigger behaviour:
 * focusability, open on hover (mouse) and focus, click/Enter/Space capture (so the
 * trigger's activation can't leak to an ancestor), the anchored surface, and the
 * `aria-describedby` link.
 */
export function Tooltip<E extends ElementType = "span">({
	as,
	content,
	children,
	...rest
}: TooltipProps<E>) {
	const popover = usePopover();
	const { id } = popover.contentProps;
	const own = rest as Composed;

	const trigger = createElement(
		as ?? "span",
		{
			...rest,
			tabIndex: own.tabIndex ?? 0,
			"aria-describedby": id,
			style: { ...own.style, ...popover.triggerProps.style },
			onPointerEnter: (e: PointerEvent) => {
				own.onPointerEnter?.(e);
				if (e.pointerType === "mouse") popover.openPopover();
			},
			onPointerLeave: (e: PointerEvent) => {
				own.onPointerLeave?.(e);
				if (e.pointerType === "mouse") popover.closePopover();
			},
			onFocus: (e: FocusEvent) => {
				own.onFocus?.(e);
				popover.openPopover();
			},
			onBlur: (e: FocusEvent) => {
				own.onBlur?.(e);
				popover.closePopover();
			},
			onClick: (e: MouseEvent) => {
				own.onClick?.(e);
				e.stopPropagation();
			},
			onKeyDown: (e: KeyboardEvent) => {
				own.onKeyDown?.(e);
				if (e.key === "Enter" || e.key === " ") e.stopPropagation();
			},
		},
		children,
	);

	return (
		<>
			{trigger}

			<BarePopover
				{...popover.contentProps}
				position="top"
				role="tooltip"
				className={styles.surface}
			>
				<Text size={1} compact weight={600}>
					{content}
				</Text>
			</BarePopover>
		</>
	);
}
