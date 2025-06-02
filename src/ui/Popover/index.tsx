"use client";

import clsx from "clsx";
import {
	type HTMLAttributes,
	type RefObject,
	type ToggleEventHandler,
	useCallback,
	useRef,
	useState,
} from "react";
import { getAnchorPositionX, getAnchorPositionY } from "@/utils/dom";
import { mergeStyleSources, toCSSVars } from "@/utils/styles";
import styles from "./styles.module.css";

export function Popover({
	anchorRef,
	children,
	popover = "auto",
	className,
	style,
	onToggle,
	...props
}: HTMLAttributes<HTMLDivElement> & {
	anchorRef: RefObject<HTMLElement | null>;
	id: string;
}) {
	const popoverRef = useRef<HTMLDivElement>(null);

	const [position, setPosition] = useState<{
		top: number;
		left: number;
	} | null>(null);

	const handleToggle: ToggleEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			if (e.newState === "open" && e.target instanceof HTMLElement) {
				const popoverRect = e.target.getBoundingClientRect();
				const anchorRect = anchorRef.current?.getBoundingClientRect();

				setPosition({
					top: getAnchorPositionY(anchorRect, popoverRect, "top"),
					left: getAnchorPositionX(anchorRect, popoverRect, "center"),
				});
			}

			onToggle?.(e);
		},
		[anchorRef, onToggle],
	);

	/**
	 * Capture submits, close popver instead of submitting form.
	 */
	const handleSubmit = useCallback(() => {
		popoverRef.current?.togglePopover();
	}, []);

	return (
		<div
			{...props}
			ref={popoverRef}
			popover={popover}
			onToggle={handleToggle}
			onSubmit={handleSubmit}
			className={clsx(className, styles.popover)}
			style={mergeStyleSources(
				style,
				toCSSVars({
					popoverTop: position?.top ? `${position.top}px` : undefined,
					popoverLeft: position?.left ? `${position.left}px` : undefined,
				}),
			)}
		>
			{children}
		</div>
	);
}
