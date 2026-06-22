"use client";

import { clsx } from "clsx";
import { AnimatePresence, m } from "motion/react";
import { createContext, type ReactNode, use, useCallback, useRef } from "react";
import { Button } from "../Button";
import { type UsePopoverReturn, usePopover } from "../hooks/usePopover";
import { Icon } from "../Icon";
import { Popover } from "../Popover";
import { stopPropagation } from "../utils/events";
import styles from "./styles.module.css";

const ContextMenuContext = createContext<UsePopoverReturn | null>(null);

export function useContextMenu() {
	const ctx = use(ContextMenuContext);
	if (!ctx) throw new Error("useContextMenu must be used within a ContextMenu");
	return ctx;
}

function getTransformOrigin(el: HTMLElement): string {
	const popoverEl = el.closest("[popover]");
	if (!popoverEl) return "top left";

	const area = getComputedStyle(popoverEl).positionArea;

	/**
	 * The small-screen fallback in Popover drops anchor positioning and
	 * centers the popover on the viewport — position-area resolves to
	 * "none". Scale-in from center matches the centered geometry; scaling
	 * from a corner looks like the menu snaps out of a random edge.
	 */
	if (area === "none") return "center";

	const isTop = area.includes("top");
	const isLeft = area.includes("left");

	return `${isTop ? "bottom" : "top"} ${isLeft ? "right" : "left"}`;
}

const ENTER_TRANSITION = { type: "spring", duration: 0.2, bounce: 0 } as const;

type Props = {
	children: ReactNode;
	heading?: ReactNode;
	footer?: ReactNode;
	label?: string;
};

export function ContextMenu({ children, heading, footer, label }: Props) {
	const popover = usePopover();

	const elRef = useRef<HTMLDivElement>(null);

	const contentRef = useCallback((el: HTMLDivElement | null) => {
		elRef.current = el;
		if (el) el.style.transformOrigin = getTransformOrigin(el);
	}, []);

	const demoteLayer = useCallback(() => {
		const el = elRef.current;
		if (el) {
			el.style.transform = "";
			el.style.opacity = "";
		}
	}, []);

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
				className={clsx({ [styles.open]: popover.isOpen })}
			>
				<Icon name="ellipsis" size={2} />
			</Button>

			<Popover
				{...popover.contentProps}
				isOpen
				position="top-right"
				className={styles.popover}
				role="menu"
				aria-label={label}
			>
				<AnimatePresence>
					{popover.isOpen ? (
						<m.div
							key="content"
							ref={contentRef}
							className={styles.content}
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{
								opacity: 0,
								scale: 0.5,
								transition: { duration: 0.1, ease: "easeIn" },
							}}
							transition={ENTER_TRANSITION}
							onAnimationComplete={demoteLayer}
						>
							{heading ? (
								<header className={styles.heading}>{heading}</header>
							) : null}

							<ContextMenuContext value={popover}>
								{children}
							</ContextMenuContext>

							{footer ? (
								<footer className={styles.footer}>{footer}</footer>
							) : null}
						</m.div>
					) : null}
				</AnimatePresence>
			</Popover>
		</>
	);
}
