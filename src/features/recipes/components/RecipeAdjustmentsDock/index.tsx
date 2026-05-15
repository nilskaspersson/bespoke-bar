"use client";

import { clsx } from "clsx";
import { type ToggleEventHandler, useMemo } from "react";
import {
	RecipeAdjustmentsControls,
	useRawAdjustments,
} from "@/features/recipes/components/RecipeAdjustments";
import { usePopover } from "@/hooks/usePopover";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { Kbd } from "@/ui/Kbd";
import { Popover } from "@/ui/Popover";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

type Props = {
	onOpenChange?: (open: boolean) => void;
};

export function RecipeAdjustmentsDock({ onOpenChange }: Props) {
	const popover = usePopover();
	const { servings, conversionSystem, withRounding, withBestUnit } =
		useRawAdjustments();

	const isModified =
		servings !== 1 ||
		conversionSystem !== null ||
		!withRounding ||
		!withBestUnit;

	const summary = useMemo(() => {
		const parts: string[] = [];
		if (servings !== 1) parts.push(`Qty: ${servings}`);
		if (conversionSystem === "metric") parts.push("Metric");
		if (conversionSystem === "imperial") parts.push("Imperial");
		return parts.join(" · ");
	}, [servings, conversionSystem]);

	const handleToggle: ToggleEventHandler<HTMLDivElement> = (e) => {
		popover.contentProps.onToggle(e);
		if (e.target !== e.currentTarget) return;
		onOpenChange?.(e.newState === "open");
	};

	function toggle() {
		if (popover.isOpen) popover.closePopover();
		else popover.openPopover();
	}

	const showChip = !popover.isOpen && isModified && summary.length > 0;

	return (
		<div className={styles.dockArea}>
			<Button
				{...popover.triggerProps}
				variant="clear"
				color="heavy"
				rounded
				size="large"
				aria-label="Quick Adjust"
				className={clsx(styles.trigger, {
					[styles.triggerHidden]: popover.isOpen,
				})}
			>
				<Icon name="sliders-horizontal" size={2} />
				<Text as="span" size={2} weight={600} compact>
					Quick Adjust
				</Text>
				<Kbd shortcut="mod+e" variant="ghost" onTrigger={toggle} />
			</Button>

			<Popover
				{...popover.contentProps}
				onToggle={handleToggle}
				position="top-overlap"
				className={styles.panel}
				role="dialog"
				aria-label="Quick Adjust"
			>
				<Button
					popoverTarget={popover.triggerProps.popoverTarget}
					popoverTargetAction="hide"
					variant="ghost"
					icon
					rounded
					className={styles.closeButton}
					aria-label="Close"
				>
					<Icon name="xmark" size={2} />
				</Button>

				<RecipeAdjustmentsControls className={styles.controls} />
			</Popover>

			{showChip ? <span className={styles.summaryChip}>{summary}</span> : null}
		</div>
	);
}
