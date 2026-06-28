"use client";

import { pluralize } from "@bespoke/domain/utils/formatting";
import type { Menu } from "@bespoke/schema/schema/menus";
import { Button } from "@bespoke/ui/Button";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Icon } from "@bespoke/ui/Icon";
import { Input } from "@bespoke/ui/Input";
import { Kbd } from "@bespoke/ui/Kbd";
import { Skeleton } from "@bespoke/ui/Skeleton";
import { Text } from "@bespoke/ui/Text";
import { Time } from "@bespoke/ui/Time";
import { handleKey } from "@bespoke/ui/utils/keyboard";
import { clsx } from "clsx";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { createSearchIndex, searchByIndex } from "@/utils/search";
import styles from "./styles.module.css";

export type MenuSidebarItem = Pick<
	Menu,
	"id" | "name" | "description" | "isFeatured" | "createdAt" | "updatedAt"
> & {
	recipeCount: number;
	href: string;
};

const SKELETON_ROWS = Array.from({ length: 16 }, (_, index) => `row-${index}`);

const getMenuKey = (menu: MenuSidebarItem) => menu.id;

const getMenuSearchFields = (menu: MenuSidebarItem) => [
	menu.name,
	menu.description ?? "",
];

/**
 * Featured menu first, then the order it arrived in (most-recently-updated).
 * Array.prototype.sort is stable, so the incoming order is preserved within
 * each group.
 */
function pinFeatured(menus: MenuSidebarItem[]): MenuSidebarItem[] {
	return [...menus].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
}

/**
 * Callback ref on the active item that centers it within the list. Finds the
 * scroll container from the element (not a ref) because on mount the item's ref
 * fires before the container's would be set, and scrolls only that container —
 * `scrollIntoView` would also scroll the document on the detail route.
 */
function scrollActiveIntoView(element: HTMLAnchorElement | null) {
	const container = element?.closest<HTMLElement>(`.${styles.scroll}`);

	if (!element || !container) {
		return;
	}

	const containerRect = container.getBoundingClientRect();
	const elementRect = element.getBoundingClientRect();

	const delta =
		elementRect.top +
		elementRect.height / 2 -
		(containerRect.top + containerRect.height / 2);

	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;

	container.scrollTo({
		top: container.scrollTop + delta,
		behavior: prefersReducedMotion ? "auto" : "smooth",
	});
}

export function MenuSidebar({ menus }: { menus: MenuSidebarItem[] }) {
	const router = useRouter();
	const activeId = useSelectedLayoutSegment();
	const filterRef = useRef<HTMLInputElement>(null);

	const [filter, setFilter] = useState("");
	const deferredFilter = useDeferredValue(filter);

	const searchIndex = useMemo(
		() => createSearchIndex(menus, getMenuKey, getMenuSearchFields),
		[menus],
	);

	const visible = useMemo(
		() =>
			pinFeatured(
				searchByIndex(menus, searchIndex, getMenuKey, deferredFilter),
			),
		[menus, searchIndex, deferredFilter],
	);

	return (
		<div className={styles.sidebar}>
			<Grid className={styles.header} gap={2}>
				<Input
					ref={filterRef}
					type="search"
					value={filter}
					onChange={(event) => setFilter(event.target.value)}
					onKeyDown={handleKey([
						[
							"Enter",
							() => router.push(visible[0].href),
							() => visible.length > 0,
						],
					])}
					placeholder="Name or description…"
					aria-label="Name or description"
					autoComplete="off"
					startAdornment={<Icon name="magnifying-glass" size={4} />}
					endAdornment={
						<Kbd
							shortcut="mod+f"
							onTrigger={() => filterRef.current?.focus()}
						/>
					}
					rounded
					fullWidth
				/>

				<Flex
					wrap
					justifyContent="space-between"
					alignItems="baseline"
					gap={3}
					className={styles.status}
				>
					<Text as="p" size={1} light numeric>
						{deferredFilter
							? `${visible.length} matching`
							: `${menus.length} ${pluralize(menus.length, "menu")}`}
					</Text>

					{visible.length > 0 ? (
						<Text as="p" size={1} light compact className="touch-hidden">
							Open first: <Kbd shortcut="Enter" visual />
						</Text>
					) : null}
				</Flex>
			</Grid>

			{visible.length === 0 ? (
				<Grid
					className={styles.empty}
					gap={2}
					alignContent="center"
					justifyItems="center"
				>
					<Text as="p" size={2} light align="center">
						{menus.length === 0
							? "No Menus yet."
							: "No Menu matches that filter."}
					</Text>

					{deferredFilter ? (
						<Button
							variant="outline"
							color="amber"
							size="tiny"
							onClick={() => setFilter("")}
						>
							Clear filter
						</Button>
					) : null}
				</Grid>
			) : (
				<nav aria-label="Menus" className={styles.scroll}>
					<Grid as="ul" gap={1}>
						{visible.map((menu) => (
							<li key={menu.id}>
								<Link
									ref={menu.id === activeId ? scrollActiveIntoView : undefined}
									href={menu.href}
									prefetch={false}
									aria-current={menu.id === activeId ? "page" : undefined}
									className={clsx(styles.link, {
										[styles.featured]: menu.isFeatured,
									})}
								>
									<div className={styles.nameRow}>
										{menu.isFeatured ? (
											<Icon name="star" size={1} className={styles.star} />
										) : null}

										<Text
											as="span"
											size={3}
											weight={500}
											truncate
											compact
											className={styles.name}
										>
											{menu.name}
										</Text>
									</div>

									<div className={styles.meta}>
										<Text as="span" size={1} truncate compact>
											{menu.recipeCount} {pluralize(menu.recipeCount, "recipe")}
										</Text>

										<Time
											date={menu.updatedAt ?? menu.createdAt}
											size={1}
											light
											className={styles.time}
										/>
									</div>
								</Link>
							</li>
						))}
					</Grid>
				</nav>
			)}
		</div>
	);
}

export function MenuSidebarSkeleton() {
	return (
		<div className={styles.sidebar} aria-hidden>
			<Grid className={styles.header} gap={2}>
				<Skeleton variant="text" height="3rem" />

				<Flex
					wrap
					justifyContent="space-between"
					alignItems="baseline"
					gap={3}
					className={styles.status}
				>
					<Skeleton variant="text" width="5rem" height="1.125rem" />

					<Skeleton
						variant="text"
						width="5rem"
						height="1.125rem"
						className="touch-hidden"
					/>
				</Flex>
			</Grid>

			<div className={styles.scroll}>
				<ul>
					{SKELETON_ROWS.map((key) => (
						<li key={key} className={styles.skeletonItem}>
							<Skeleton variant="text" width="13ch" height="1.15rem" />
							<Skeleton variant="text" width="9ch" height="0.8rem" />
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
