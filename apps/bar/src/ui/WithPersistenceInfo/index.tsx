"use client";

import { clsx } from "clsx";
import { type ReactNode, useCallback } from "react";
import { type UsePopoverReturn, usePopover } from "@/hooks/usePopover";
import { useScheduledCallback } from "@/hooks/useScheduledCallback";
import type { IconName } from "@/libs/icons/types";
import { Icon } from "@/ui/Icon";
import type { Scale } from "@/utils/types";
import styles from "./styles.module.css";

type Scope = "local" | "session";

const SAVED_HINT_DURATION = 1500;

const SCOPE_LABEL: Record<Scope, string> = {
	local: "Saved across sessions",
	session: "Saved for this session",
};

const SCOPE_ICON: Record<Scope, IconName> = {
	local: "arrow-down-to-arc",
	session: "arrow-down-to-dotted-line",
};

export type PersistenceInfo = UsePopoverReturn & {
	notify: () => void;
};

/**
 * Owns a manual popover + a `notify()` trigger that opens it briefly.
 * Pair with `<WithPersistenceInfo>` and call `persistence.notify()`
 * from the wrapped control's change handler.
 */
export function usePersistenceInfo(): PersistenceInfo {
	const popover = usePopover({ type: "manual" });
	const schedule = useScheduledCallback();

	const notify = useCallback(() => {
		popover.openPopover();
		schedule(popover.closePopover, SAVED_HINT_DURATION);
	}, [popover.openPopover, popover.closePopover, schedule]);

	return { ...popover, notify };
}

/**
 * Decorates a control with a "this is persisted" indicator anchored to
 * a "Saved!" popover. Drive the open/close lifecycle via
 * `usePersistenceInfo()` from the consumer.
 */
export function WithPersistenceInfo({
	persistent,
	persistence,
	children,
	iconSize = 1,
	className,
}: {
	persistent: Scope;
	persistence: PersistenceInfo;
	children: ReactNode;
	iconSize?: Scale;
	className?: string;
}) {
	const label = SCOPE_LABEL[persistent];

	return (
		<div className={clsx(className, styles.root)}>
			{children}

			<span
				{...persistence.triggerProps}
				className={styles.indicator}
				title={label}
			>
				<Icon
					name={SCOPE_ICON[persistent]}
					size={iconSize}
					aria-label={label}
				/>
			</span>

			{/**
			 * Bare-bones popover element — top-layer placement + anchor
			 * positioning are all we need. No overlay click capture, no
			 * mobile-modal fallback.
			 */}
			<div
				id={persistence.contentProps.id}
				ref={persistence.contentProps.ref}
				popover={persistence.contentProps.popover}
				role="status"
				className={styles.savedHint}
				style={{
					positionAnchor: `--${persistence.contentProps.anchorId}`,
				}}
			>
				Saved!
			</div>
		</div>
	);
}
