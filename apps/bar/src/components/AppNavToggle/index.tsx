"use client";

import { Button } from "@bespoke/ui/Button";
import { usePopover } from "@bespoke/ui/hooks/usePopover";
import { Icon } from "@bespoke/ui/Icon";
import { Popover } from "@bespoke/ui/Popover";
import { m } from "motion/react";
import { AppNav } from "@/components/AppNav";
import styles from "./styles.module.css";

const chipPushTransition = {
	type: "spring",
	visualDuration: 0.18,
	bounce: 0,
} as const;

export function AppNavToggle() {
	const popover = usePopover();

	return (
		<div className={styles.toggle}>
			<m.div
				animate={{ opacity: popover.isOpen ? 0 : 1 }}
				transition={chipPushTransition}
				aria-hidden={popover.isOpen}
			>
				<Button
					{...popover.triggerProps}
					variant="clear"
					color="light"
					icon
					aria-label="Navigation"
					title="Navigation"
					size="large"
				>
					<m.span
						className={styles.morph}
						animate={{ scale: popover.isOpen ? 0 : 1 }}
						transition={chipPushTransition}
					>
						<Icon name="bars" size={4} />
					</m.span>
				</Button>
			</m.div>

			<Popover
				{...popover.contentProps}
				position="top-overlap-start"
				keepAnchored
				className={styles.popoverHost}
				role="menu"
				aria-label="Sections"
			>
				<AppNav onClose={popover.closePopover} />
			</Popover>
		</div>
	);
}
