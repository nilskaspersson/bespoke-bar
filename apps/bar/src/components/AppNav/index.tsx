"use client";

import { Button, LinkButton } from "@bespoke/ui/Button";
import { Icon } from "@bespoke/ui/Icon";
import type { IconName } from "@bespoke/ui/icons/types";
import { Text } from "@bespoke/ui/Text";
import { clsx } from "clsx";
import { m } from "motion/react";
import type { Route } from "next";
import { ThemePicker } from "@/components/ThemePicker";
import { WakeLock } from "@/components/WakeLock";
import styles from "./styles.module.css";

type Item = {
	href: Route;
	label: string;
	match: string;
	icon: IconName;
};

const ITEMS: readonly Item[] = [
	{
		href: "/settings",
		label: "Settings",
		match: "/settings",
		icon: "gear",
	},
	{
		href: "/ingredients",
		label: "Ingredients",
		match: "/ingredients",
		icon: "duotone-wine-bottle",
	},
	{
		href: "/menus",
		label: "Menus",
		match: "/menus",
		icon: "duotone-memo-pad",
	},
	{
		href: "/recipes",
		label: "Recipes",
		match: "/recipes",
		icon: "duotone-martini-glass",
	},
] as const;

const itemTransition = {
	type: "spring",
	visualDuration: 0.5,
	bounce: 0.05,
} as const;

const ITEM_DELAY_BASE = 0.02;
const ITEM_DELAY_STEP = 0.02;

function cascade(index: number) {
	return {
		initial: { opacity: 0, y: 3 },
		animate: { opacity: 1, y: 0 },
		transition: {
			...itemTransition,
			delay: ITEM_DELAY_BASE + ITEM_DELAY_STEP * index,
		},
	};
}

/**
 * Cascade positions counted bottom-up so animation order matches visual order:
 * close enters first, preferences last.
 */
const CASCADE_CLOSE = 0;
const CASCADE_LIST_START = 1;
const CASCADE_CREATE = CASCADE_LIST_START + ITEMS.length;
const CASCADE_PREFERENCES = CASCADE_CREATE + 1;

type Props = {
	onClose: () => void;
};

export function AppNav({ onClose }: Props) {
	return (
		<div className={styles.panel}>
			<m.div className={styles.block} {...cascade(CASCADE_PREFERENCES)}>
				<ThemePicker />
				<WakeLock className={styles.wakeLock} />
			</m.div>

			<m.div className={styles.block} {...cascade(CASCADE_CREATE)}>
				<LinkButton
					href="/recipes/create"
					variant="solid"
					color="accent"
					fullWidth
					onClick={onClose}
				>
					Create Recipe
				</LinkButton>
			</m.div>

			<div className={clsx(styles.block, styles.compact)}>
				<ul>
					{ITEMS.map((item, index) => {
						const reverseIndex = ITEMS.length - 1 - index;

						return (
							<m.li
								key={item.href}
								{...cascade(CASCADE_LIST_START + reverseIndex)}
							>
								<LinkButton
									href={item.href}
									variant="ghost"
									color="accent"
									fullWidth
									className={styles.item}
									onClick={onClose}
								>
									<Icon name={item.icon} size={2} />
									<Text size={2}>{item.label}</Text>
								</LinkButton>
							</m.li>
						);
					})}
				</ul>
			</div>

			<m.div
				className={clsx(styles.block, styles.compact)}
				{...cascade(CASCADE_CLOSE)}
			>
				<Button
					variant="ghost"
					color="heavy"
					rounded
					fullWidth
					className={styles.item}
					onClick={onClose}
				>
					<span className={styles.morph}>
						<Icon name="xmark" size={3} />
					</span>

					<Text size={2} className={styles.label}>
						Close
					</Text>
				</Button>
			</m.div>
		</div>
	);
}
