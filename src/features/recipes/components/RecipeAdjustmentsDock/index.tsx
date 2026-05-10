"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
	RecipeAdjustmentsControls,
	useRawAdjustments,
} from "@/features/recipes/components/RecipeAdjustments";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { Kbd } from "@/ui/Kbd";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

const SPRING = {
	type: "spring" as const,
	visualDuration: 0.25,
	bounce: 0.15,
};

const CHIP_SPRING = {
	type: "spring" as const,
	visualDuration: 0.2,
	bounce: 0.4,
};

const SHARED_LAYOUT_ID = "adjustments-dock-shape";

type Props = {
	onOpenChange?: (open: boolean) => void;
};

export function RecipeAdjustmentsDock({ onOpenChange }: Props) {
	const [open, setOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const { servings, conversionSystem, withRounding, withBestUnit } =
		useRawAdjustments();

	const isModified =
		servings !== 1 ||
		conversionSystem !== null ||
		!withRounding ||
		!withBestUnit;

	const summary: string[] = [];
	if (servings !== 1) summary.push(`Qty: ${servings}`);
	if (conversionSystem === "metric") summary.push("Metric");
	if (conversionSystem === "imperial") summary.push("Imperial");
	if (!withRounding) summary.push("No rounding");
	if (!withBestUnit) summary.push("Original units");

	useEffect(() => {
		onOpenChange?.(open);
	}, [open, onOpenChange]);

	useEffect(() => {
		const el = panelRef.current;
		if (!open || !el) return;

		if (!el.matches(":popover-open")) {
			el.showPopover();
		}

		function handleBeforeToggle(event: Event) {
			const e = event as ToggleEvent;
			if (e.newState === "closed") {
				e.preventDefault();
				setOpen(false);
			}
		}

		el.addEventListener("beforetoggle", handleBeforeToggle);
		return () => el.removeEventListener("beforetoggle", handleBeforeToggle);
	}, [open]);

	return (
		<div className={styles.dockArea}>
			<AnimatePresence>
				{open ? (
					<m.div
						key="panel"
						ref={panelRef}
						layoutId={SHARED_LAYOUT_ID}
						popover="auto"
						role="dialog"
						aria-label="Quick adjust recipes"
						className={styles.panel}
						transition={SPRING}
					>
						<Button
							variant="ghost"
							className={styles.closeButton}
							onClick={() => setOpen(false)}
							aria-label="Close"
						>
							<Icon name="xmark" size={2} />
						</Button>

						<RecipeAdjustmentsControls className={styles.controls} />
					</m.div>
				) : (
					<m.div
						key="trigger"
						layoutId={SHARED_LAYOUT_ID}
						className={styles.triggerWrap}
						transition={SPRING}
					>
						<Button
							variant="clear"
							color="heavy"
							rounded
							size="large"
							onClick={() => setOpen(true)}
							aria-label="Quick adjust recipes"
						>
							<Icon name="sliders-horizontal" size={2} />
							<Text as="span" size={2} weight={600} compact>
								Quick Adjust Recipes
							</Text>
							<Kbd
								shortcut="mod+e"
								variant="ghost"
								onTrigger={() => setOpen((o) => !o)}
							/>
						</Button>
					</m.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{!open && isModified ? (
					<m.span
						key="chip"
						className={styles.summaryChip}
						initial={{ opacity: 0, scale: 0.6, y: 4 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.6, y: 4 }}
						transition={CHIP_SPRING}
					>
						{summary.join(" · ")}
					</m.span>
				) : null}
			</AnimatePresence>
		</div>
	);
}
