"use client";

import type { ComponentProps, CSSProperties } from "react";
import { useCallback, useId, useRef, useState } from "react";

export type PopoverType = NonNullable<ComponentProps<"div">["popover"]>;

type UsePopoverOptions = {
	/**
	 * The popover type.
	 * - "auto": Light-dismisses and closes other auto popovers (menus, dialogs)
	 * - "hint": Light-dismisses but coexists with other popovers (tooltips)
	 * - "manual": No light-dismiss, must be closed programmatically
	 * @default "auto"
	 */
	type?: PopoverType;
};

export type UsePopoverReturn = {
	popoverId: string;
	isOpen: boolean;
	/**
	 * Spread over the trigger element.
	 */
	triggerProps: {
		"aria-expanded": boolean;
		style: CSSProperties;
		popoverTarget: string;
	};
	/**
	 * Spread over a Popover component.
	 */
	contentProps: {
		id: string;
		ref: React.RefObject<HTMLDivElement | null>;
		anchorId: string;
		popover: PopoverType;
		onToggle: React.ToggleEventHandler<HTMLDivElement>;
		isOpen: boolean;
	};
	openPopover: () => void;
	closePopover: () => void;
};

export function usePopover(options: UsePopoverOptions = {}): UsePopoverReturn {
	const { type: popover = "auto" } = options;
	const popoverId = useId();
	const popoverRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);

	const openPopover = useCallback(() => {
		const el = popoverRef.current;

		if (el?.isConnected) {
			el.showPopover();
		}
	}, []);

	const closePopover = useCallback(() => {
		const el = popoverRef.current;

		if (el?.isConnected) {
			el.hidePopover();
		}
	}, []);

	/**
	 * Sync internal state with native popover state changes.
	 * Handles light dismiss, Escape key, and other native dismissal methods.
	 *
	 * React simulates bubbling for non-bubbling events like `toggle`, so this
	 * handler would otherwise fire for toggles from any descendant dialog,
	 * popover, or details element. Guard against that by ignoring events whose
	 * target isn't the popover itself.
	 */
	const onToggle: React.ToggleEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			if (e.target !== e.currentTarget) return;
			setIsOpen(e.newState === "open");
		},
		[],
	);

	const triggerProps = {
		"aria-expanded": isOpen,
		popoverTarget: popoverId,
		style: {
			anchorName: `--${popoverId}`,
		} satisfies CSSProperties,
	};

	const contentProps = {
		id: popoverId,
		ref: popoverRef,
		anchorId: popoverId,
		popover,
		onToggle,
		isOpen,
	};

	return {
		popoverId,
		isOpen,
		triggerProps,
		contentProps,
		openPopover,
		closePopover,
	};
}
