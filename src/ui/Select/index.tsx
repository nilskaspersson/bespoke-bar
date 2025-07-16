"use client";

import { clsx } from "clsx";
import { type UseSelectProps, useSelect } from "downshift";
import { type ComponentProps, useId } from "react";
import { ControlLabel } from "@/ui/ControlLabel";
import formControlStyles from "@/ui/FormControl/styles.module.css";
import { OptionItem } from "@/ui/OptionItem";
import { OptionsList } from "@/ui/OptionsList";
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

/**
 * This component is not quite idiomatic to downshift. There are two larger issues
 * with this structure:
 *
 * 1. WAI-ARIA patterns for select/comboboxes does not allow for the listbox and
 *    options to be separated, which means we couldn't support a footer or other
 *    supplementary nodes.
 * 2. Downshift needs the "Menu" to always be rendered, which further means we cannot
 *    even really style the Lightbox even if it was the list.
 *
 * But, I can't let perfect be the enemy of good. Maybe solve one of these issues
 * in the future.
 */
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

	const {
		isOpen,
		selectedItem,
		getToggleButtonProps,
		getLabelProps,
		getMenuProps,
		highlightedIndex,
		getItemProps,
	} = useSelect({
		items,
		defaultSelectedItem: defaultValue
			? items.find((o) => getItemValue(o) === defaultValue)
			: undefined,
		itemToString,
		scrollIntoView: (node) =>
			node?.scrollIntoView({ behavior: "instant", block: "nearest" }),
		...selectProps,
	});

	return (
		<ControlLabel
			{...props}
			{...getLabelProps()}
			className={clsx(styles.base, className)}
			aria-describedby={helperText ? helperTextId : undefined}
		>
			<div className={styles.contain}>
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

				<div {...getMenuProps()}>
					<input
						type="hidden"
						name={name}
						value={selectedItem ? getItemValue(selectedItem) : ""}
					/>

					{isOpen ? (
						<OptionsList footer={footer}>
							{items.map((item, index) => (
								<OptionItem
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
								</OptionItem>
							))}
						</OptionsList>
					) : null}
				</div>
			</div>

			{helperText ? (
				<Text size={1} id={helperTextId}>
					{helperText}
				</Text>
			) : null}
		</ControlLabel>
	);
}
