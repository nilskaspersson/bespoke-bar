"use client";

import type { Table } from "@tanstack/react-table";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, useRef } from "react";
import { BottomRailItems } from "@/components/BottomRail";
import { EmptyArea } from "@/components/EmptyArea";
import { Button } from "@/ui/Button";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Input } from "@/ui/Input";
import { Lightbox } from "@/ui/Lightbox";
import { Text } from "@/ui/Text";
import { normalizeInput } from "@/utils";
import styles from "./styles.module.css";

export function TableLayout<T extends Record<PropertyKey, unknown>>({
	className,
	children,
	table,
	searchPlaceholder,
	disableSearch,
	...props
}: ComponentPropsWithRef<"section"> & {
	table: Table<T>;
	searchPlaceholder?: string;
	disableSearch?: boolean;
}) {
	const formRef = useRef<HTMLFormElement>(null);
	const baseRef = useRef<HTMLDivElement>(null);

	const hasActiveFilter = Boolean(table.getState().globalFilter);
	const isFilteredEmpty =
		hasActiveFilter &&
		table.getCoreRowModel().rows.length > 0 &&
		table.getRowCount() === 0;

	const clearSearch = () => {
		table.resetGlobalFilter();
		formRef.current?.reset();
	};

	return (
		<section ref={baseRef} className={clsx(className, styles.base)} {...props}>
			<Grid gap={3}>
				{!isFilteredEmpty ? (
					children
				) : (
					<EmptyArea color="accent">
						<Heading level="h6">Nothing matches your search</Heading>

						<Button
							variant="outline"
							color="accent"
							size="small"
							onClick={clearSearch}
						>
							Clear search
						</Button>
					</EmptyArea>
				)}
			</Grid>

			<BottomRailItems>
				<div className={styles.dock}>
					{hasActiveFilter ? (
						<div className={styles.statusContainer}>
							<Text as="div" size={0} compact className={styles.status} heavy>
								{table.getRowCount()}{" "}
								{table.getRowCount() === 1 ? "row" : "rows"} matching "
								{table.getState().globalFilter}"
							</Text>
						</div>
					) : null}

					{!disableSearch ? (
						<Lightbox rounded className={styles.search} theme="light">
							<form
								ref={formRef}
								onSubmit={(e) => {
									e.preventDefault();
									baseRef.current?.scrollIntoView({
										behavior: "smooth",
										block: "start",
									});
								}}
							>
								<Input
									type="search"
									rounded
									placeholder={searchPlaceholder ?? "Search…"}
									onChange={(e) =>
										table.setGlobalFilter(normalizeInput(e.target.value))
									}
								/>

								{hasActiveFilter ? (
									<Button
										variant="base"
										icon
										className={styles.clear}
										onClick={clearSearch}
									>
										<Icon name="xmark" />
									</Button>
								) : null}
							</form>
						</Lightbox>
					) : null}
				</div>
			</BottomRailItems>
		</section>
	);
}
