"use client";

import { clsx } from "clsx";
import { type UseSelectProps, useSelect } from "downshift";
import { type ComponentProps, useId } from "react";
import { useIndexedItems } from "@/hooks/useIndexedItems";
import { usePopover } from "@/hooks/usePopover";
import { ControlLabel } from "@/ui/ControlLabel";
import formControlStyles from "@/ui/FormControl/styles.module.css";
import { Menu } from "@/ui/Menu";
import { Text } from "@/ui/Text";
import { getKey, type Keyed } from "@/utils/withKey";
import styles from "./styles.module.css";

type Props<T> = {
	className?: string;
	compact?: boolean;
	defaultValue?: string;
	footer?: React.ReactNode;
	getItemLabel?: (item: Keyed<T>) => React.ReactNode;
	getItemValue: (item: Keyed<T>) => string;
	helperText?: React.ReactNode;
	items: Keyed<T>[];
	itemToString: (item: Keyed<T> | null) => string;
	name: string;
	placeholder?: React.ReactNode;
	rounded?: boolean;
	buttonProps?: ComponentProps<"button">;
	selectProps?: Partial<UseSelectProps<Keyed<T>>>;
};

export function Select<T>({
	className,
	compact = false,
	defaultValue,
	footer,
	getItemLabel,
	getItemValue,
	helperText,
	items,
	itemToString,
	name,
	rounded,
	placeholder,
	selectProps,
	buttonProps,
	...props
}: Props<T> & Partial<ComponentProps<typeof ControlLabel>>) {
	const helperTextId = useId();

	const itemsByValue = useIndexedItems(items, getItemValue);

	const popover = usePopover({ type: "manual" });

	const {
		selectedItem,
		getToggleButtonProps,
		getLabelProps,
		getMenuProps,
		highlightedIndex,
		getItemProps,
	} = useSelect({
		items,
		defaultSelectedItem: defaultValue
			? itemsByValue.get(defaultValue)
			: undefined,
		itemToString,
		scrollIntoView: (node) =>
			node?.scrollIntoView({ behavior: "instant", block: "nearest" }),
		...selectProps,
		onIsOpenChange(changes) {
			if (changes.isOpen) {
				popover.openPopover();
			} else {
				popover.closePopover();
			}

			selectProps?.onIsOpenChange?.(changes);
		},
	});

	return (
		<ControlLabel
			{...props}
			{...getLabelProps()}
			className={clsx(styles.base, className)}
			aria-describedby={helperText ? helperTextId : undefined}
		>
			<div
				className={styles.contain}
				style={{ anchorName: `--${popover.popoverId}` }}
			>
				<button
					{...buttonProps}
					{...getToggleButtonProps()}
					type="button"
					className={clsx(
						buttonProps?.className,
						styles.button,
						formControlStyles.reset,
						formControlStyles.control,
						{
							[styles.hasValue]: Boolean(selectedItem),
							[formControlStyles.compact]: compact,
							[formControlStyles.rounded]: rounded,
						},
					)}
				>
					{selectedItem
						? itemToString(selectedItem)
						: (placeholder ?? "Select…")}
				</button>
			</div>

			<input
				type="hidden"
				name={name}
				value={selectedItem ? getItemValue(selectedItem) : ""}
			/>

			<Menu
				{...popover.contentProps}
				isOpen
				keepAnchored
				style={{ width: "anchor-size(width)" }}
				listProps={getMenuProps()}
				footer={footer}
			>
				{items.map((item, index) => (
					<Menu.Item
						key={getKey(item)}
						{...getItemProps({ item, index })}
						isHighlighted={highlightedIndex === index}
						isSelected={
							selectedItem
								? getItemValue(selectedItem) === getItemValue(item)
								: false
						}
					>
						{getItemLabel ? (
							getItemLabel(item)
						) : (
							<Text size={3} heavy>
								{itemToString(item)}
							</Text>
						)}
					</Menu.Item>
				))}
			</Menu>

			{helperText ? (
				<Text size={1} id={helperTextId}>
					{helperText}
				</Text>
			) : null}
		</ControlLabel>
	);
}
