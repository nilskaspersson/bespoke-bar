"use client";

import { m } from "motion/react";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { SearchRecipesButton } from "@/features/recipes/components/SearchRecipesForm";
import { usePopover } from "@/hooks/usePopover";
import type { IconName } from "@/libs/icons/types";
import { Button, LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { Popover } from "@/ui/Popover";
import { Text } from "@/ui/Text";

import styles from "./styles.module.css";

type Item = {
	href: Route;
	label: string;
	match: string;
	icon: IconName;
};

const ITEMS: readonly Item[] = [
	{
		href: "/bar/lists",
		label: "Lists",
		match: "/bar/lists",
		icon: "duotone-memo-pad",
	},
	{
		href: "/bar2",
		label: "Recipes",
		match: "/bar2",
		icon: "duotone-martini-glass",
	},
	{
		href: "/bar/ingredients",
		label: "Ingredients",
		match: "/bar/ingredients",
		icon: "duotone-wine-bottle",
	},
] as const;

const transition = {
	type: "spring",
	visualDuration: 0.22,
	bounce: 0.15,
} as const;

const wiggleTransition = {
	type: "spring",
	visualDuration: 0.34,
	bounce: 0.4,
} as const;

const ITEM_DELAY_BASE = 0.12;
const ITEM_DELAY_STEP = 0.04;

const chipPushTransition = {
	type: "spring",
	visualDuration: 0.18,
	bounce: 0,
} as const;

const xPopTransition = {
	type: "spring",
	visualDuration: 0.24,
	bounce: 0.45,
	delay: 0.08,
} as const;

export function BarSectionDock() {
	const popover = usePopover();
	const pathname = usePathname();

	const active =
		ITEMS.find((item) => pathname.startsWith(item.match)) ?? ITEMS[1];

	const topActionDelay = ITEM_DELAY_BASE + ITEM_DELAY_STEP * ITEMS.length;

	return (
		<div className={styles.dock}>
			<m.div
				animate={{ opacity: popover.isOpen ? 0 : 1 }}
				transition={chipPushTransition}
				aria-hidden={popover.isOpen}
			>
				<Button
					{...popover.triggerProps}
					variant="clear"
					color="heavy"
					icon
					aria-label="Navigation"
				>
					<m.span
						className={styles.morph}
						animate={{ scale: popover.isOpen ? 0 : 1 }}
						transition={chipPushTransition}
					>
						<Icon name="bars" size={3} />
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
				<div className={styles.panel}>
					<m.div
						aria-hidden
						className={styles.background}
						initial={{ scaleX: 0.5, scaleY: 0.15, x: 8, y: -8 }}
						animate={{ scaleX: 1, scaleY: 1, x: 0, y: 0 }}
						style={{ transformOrigin: "bottom left" }}
						transition={{
							default: transition,
							x: wiggleTransition,
							y: wiggleTransition,
						}}
					/>

					<div className={styles.content}>
						<div className={styles.actions}>
							<m.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									...transition,
									delay: topActionDelay + ITEM_DELAY_STEP,
								}}
							>
								<SearchRecipesButton
									variant="outline"
									size="small"
									color="light"
									fullWidth
								>
									<Icon name="magnifying-glass" size={1} />
									Quick search
								</SearchRecipesButton>
							</m.div>

							<m.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									...transition,
									delay: topActionDelay,
								}}
							>
								<LinkButton
									href="/bar/recipes/create"
									variant="solid"
									size="small"
									color="accent"
									fullWidth
									onClick={popover.closePopover}
								>
									Create Recipe
								</LinkButton>
							</m.div>
						</div>

						<ul className={styles.list}>
							{ITEMS.map((item, index) => {
								const isActive = item.href === active.href;
								const reverseIndex = ITEMS.length - 1 - index;
								return (
									<m.li
										key={item.href}
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											...transition,
											delay: ITEM_DELAY_BASE + ITEM_DELAY_STEP * reverseIndex,
										}}
									>
										{isActive ? (
											<Button
												variant="ghost"
												color="light"
												size="small"
												fullWidth
												aria-current="page"
												className={styles.item}
												onClick={popover.closePopover}
											>
												<Icon name={item.icon} size={2} />
												<Text size={2} className={styles.label}>
													{item.label}
												</Text>
											</Button>
										) : (
											<LinkButton
												href={item.href}
												variant="ghost"
												color="light"
												size="small"
												fullWidth
												className={styles.item}
												onClick={popover.closePopover}
											>
												<Icon name={item.icon} size={2} />
												<Text size={2} className={styles.label}>
													{item.label}
												</Text>
											</LinkButton>
										)}
									</m.li>
								);
							})}
						</ul>

						<div className={styles.close}>
							<Button
								variant="ghost"
								color="light"
								fullWidth
								className={styles.item}
								onClick={popover.closePopover}
							>
								<m.span
									className={styles.morph}
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={xPopTransition}
								>
									<Icon name="xmark" size={3} />
								</m.span>

								<Text size={2} className={styles.label}>
									Close
								</Text>
							</Button>
						</div>
					</div>
				</div>
			</Popover>
		</div>
	);
}
