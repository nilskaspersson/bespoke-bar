"use client";

import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Icon } from "@/ui/Icon";
import { Lightbox } from "@/ui/Lightbox";
import { Popover } from "@/ui/Popover";
import { Text, type TextProps } from "@/ui/Text";
import styles from "./styles.module.css";

type MenuProps = ComponentProps<typeof Popover> & {
	header?: ReactNode;
	footer?: ReactNode;
	children?: ReactNode;
	listProps?: ComponentProps<"ul">;
};

function MenuRoot({
	position = "bottom-start",
	header,
	footer,
	children,
	className,
	listProps,
	...popoverProps
}: MenuProps) {
	return (
		<Popover
			{...popoverProps}
			position={position}
			className={clsx(styles.popover, className)}
		>
			<Lightbox className={styles.surface}>
				{header ? <div className={styles.header}>{header}</div> : null}
				<ul
					{...listProps}
					className={clsx(styles.options, listProps?.className)}
				>
					{children}
				</ul>
				{footer ? <div className={styles.footer}>{footer}</div> : null}
			</Lightbox>
		</Popover>
	);
}

function Item({
	className,
	children,
	isHighlighted,
	isSelected,
	...props
}: ComponentProps<"li"> & {
	isHighlighted?: boolean;
	isSelected?: boolean;
}) {
	return (
		<li
			className={clsx(styles.item, className, {
				[styles.isHighlighted]: isHighlighted,
				[styles.isSelected]: isSelected,
			})}
			{...props}
		>
			<div className={styles.label}>{children}</div>

			{isSelected ? (
				<div className={styles.icon}>
					<Icon name="check" />
				</div>
			) : null}
		</li>
	);
}

function Label({
	children,
	className,
	description,
	...props
}: TextProps & {
	description?: ReactNode;
}) {
	return (
		<>
			<Text
				as="div"
				compact
				heavy
				weight={500}
				className={clsx(styles.optionLabel, className)}
				{...props}
			>
				{children}
			</Text>

			{description ? (
				<Text as="div" size={1} compact light className={styles.description}>
					{description}
				</Text>
			) : null}
		</>
	);
}

export const Menu = Object.assign(MenuRoot, { Item, Label });
