import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Icon } from "@/ui/Icon";
import { Lightbox } from "@/ui/Lightbox";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

function OptionsListRoot({
	className,
	children,
	footer,
	header,
	...props
}: ComponentProps<typeof Lightbox> & {
	footer?: React.ReactNode;
	header?: React.ReactNode;
}) {
	return (
		<Lightbox {...props} className={clsx(styles.lightbox, className)}>
			{header ? <div className={styles.header}>{header}</div> : null}
			<ul className={styles.options}>{children}</ul>
			{footer ? <div className={styles.footer}>{footer}</div> : null}
		</Lightbox>
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
}: ComponentProps<typeof Text> & {
	description?: React.ReactNode;
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

export const OptionsList = Object.assign(OptionsListRoot, { Item, Label });
