"use client";

import type { CSSProperties } from "react";
import { useCallback, useId, useRef, useState } from "react";

type UsePopoverReturn = {
	popoverId: string;
	popoverRef: React.RefObject<HTMLDivElement | null>;
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
		onToggle: React.ToggleEventHandler<HTMLDivElement>;
	};
	openPopover: () => void;
	closePopover: () => void;
	togglePopover: () => void;
};

export function usePopover(): UsePopoverReturn {
	const popoverId = useId();
	const popoverRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);

	const openPopover = useCallback(() => {
		popoverRef.current?.showPopover();
	}, []);

	const closePopover = useCallback(() => {
		popoverRef.current?.hidePopover();
	}, []);

	const togglePopover = useCallback(() => {
		popoverRef.current?.togglePopover();
	}, []);

	/**
	 * Sync internal state with native popover state changes.
	 * Handles light dismiss, Escape key, and other native dismissal methods.
	 */
	const onToggle: React.ToggleEventHandler<HTMLDivElement> = useCallback(
		(e) => {
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
		onToggle,
	};

	return {
		popoverId,
		popoverRef,
		isOpen,
		triggerProps,
		contentProps,
		openPopover,
		closePopover,
		togglePopover,
	};
}
