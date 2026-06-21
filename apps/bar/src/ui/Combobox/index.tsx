"use client";
"use no memo";

import type { Keyed } from "@bespoke/schema/types";
import { clsx } from "clsx";
import { type UseComboboxProps, useCombobox } from "downshift";
import {
	type ComponentProps,
	useDeferredValue,
	useId,
	useMemo,
	useState,
} from "react";
import { useIndexedItems } from "@/hooks/useIndexedItems";
import { usePopover } from "@/hooks/usePopover";
import { Button } from "@/ui/Button";
import { ControlLabel } from "@/ui/ControlLabel";
import { Icon } from "@/ui/Icon";
import { Input } from "@/ui/Input";
import { Menu } from "@/ui/Menu";
import { Text } from "@/ui/Text";
import { getKey } from "@/utils/withKey";
import styles from "./styles.module.css";

type Props<T> = {
	className?: string;
	clearable?: boolean;
	defaultValue?: string;
	getItemLabel?: (item: Keyed<T>) => React.ReactNode;
	getItemValue: (item: Keyed<T>) => string;
	renderCreateListItem?: ({
		closeMenu,
		inputValue,
	}: {
		closeMenu: () => void;
		inputValue: string;
	}) => React.ReactNode;
	error?: boolean;
	header?: React.ReactNode;
	items: Keyed<T>[];
	itemToString: (item: Keyed<T> | null) => string;
	label?: React.ReactNode;
	name: string;
	value?: string;
	id?: string;
	required?: boolean;
	fullWidth?: boolean;
	helperText?: React.ReactNode;
	toggleButtonProps?: ComponentProps<typeof Button>;
	comboboxProps?: Partial<UseComboboxProps<Keyed<T>>>;
	inputProps?: Pick<
		ComponentProps<typeof Input>,
		| "className"
		| "compact"
		| "pill"
		| "rounded"
		| "name"
		| "placeholder"
		| "large"
		| "fullWidth"
		| "value"
		| "aria-invalid"
	>;
};

export function Combobox<T>({
	className,
	clearable = true,
	comboboxProps,
	defaultValue,
	getItemLabel,
	getItemValue,
	header,
	helperText,
	id,
	inputProps,
	items,
	itemToString,
	label,
	name,
	renderCreateListItem,
	required,
	toggleButtonProps,
	value,
}: Props<T>) {
	const helperTextId = useId();

	const itemsByValue = useIndexedItems(items, getItemValue);

	const popover = usePopover({ type: "manual" });

	const [inputValue, setInputValue] = useState<string | null>(null);
	const deferredInputValue = useDeferredValue<typeof inputValue>(inputValue);

	const filteredItems = useMemo(() => {
		const normalizeLabel = (item: Keyed<T>) => itemToString(item).toLowerCase();

		return deferredInputValue
			? items.filter((o) => {
					return (
						normalizeLabel(o).includes(deferredInputValue ?? "") ||
						getItemValue(o)
							.toLowerCase()
							.includes(deferredInputValue ?? "")
					);
				})
			: items;
	}, [deferredInputValue, items, itemToString, getItemValue]);

	const {
		closeMenu,
		getInputProps,
		getItemProps,
		getLabelProps,
		getMenuProps,
		getToggleButtonProps,
		highlightedIndex,
		isOpen,
		openMenu,
		reset,
		selectedItem,
	} = useCombobox({
		...comboboxProps,
		onInputValueChange({ inputValue, type }) {
			setInputValue(inputValue.trim().toLowerCase());
			comboboxProps?.onInputValueChange?.({ inputValue, type });
		},
		onIsOpenChange(changes) {
			if (changes.isOpen) {
				popover.openPopover();
			} else {
				popover.closePopover();
			}
			comboboxProps?.onIsOpenChange?.(changes);
		},
		items: filteredItems,
		itemToString,
		/**
		 * Fallback to null to avoid switching between controlled/uncontrolled state.
		 */
		selectedItem:
			value !== undefined ? (itemsByValue.get(value) ?? null) : undefined,
		defaultSelectedItem: defaultValue
			? itemsByValue.get(defaultValue)
			: undefined,
		scrollIntoView: (node) =>
			node?.scrollIntoView({ behavior: "instant", block: "nearest" }),
	});

	const comboboxInputProps = getInputProps();

	return (
		<ControlLabel
			{...getLabelProps()}
			label={label}
			required={required}
			className={clsx(styles.base, className, {
				[styles.compact]: inputProps?.compact,
				[styles.fullWidth]: inputProps?.fullWidth,
				[styles.large]: inputProps?.large,
			})}
		>
			<div
				className={styles.contain}
				id={id}
				style={{ anchorName: `--${popover.popoverId}` }}
			>
				<Input
					{...inputProps}
					{...comboboxInputProps}
					title={comboboxInputProps.value}
					type="search"
					className={clsx(styles.input, inputProps?.className)}
				/>

				<menu className={styles.actions}>
					{deferredInputValue && clearable ? (
						<Button
							variant="base"
							icon
							size="tiny"
							onClick={reset}
							className={styles.clear}
						>
							<Icon name="xmark" size={1} />
						</Button>
					) : null}

					<Button
						variant="base"
						{...getToggleButtonProps()}
						{...toggleButtonProps}
						icon
						className={clsx(styles.toggle, toggleButtonProps?.className, {
							[styles.rounded]: inputProps?.rounded,
							[styles.compact]: inputProps?.compact,
						})}
					>
						<Icon
							name="angle-down"
							className={clsx(styles.icon, { [styles.isOpen]: isOpen })}
						/>
					</Button>
				</menu>
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
				header={header}
				footer={
					items.length > filteredItems.length ? (
						<Button
							variant="outline"
							size="tiny"
							className={styles.reset}
							onClick={() => {
								reset();
								openMenu();
							}}
						>
							Clear filters
						</Button>
					) : null
				}
			>
				{filteredItems.map((item, index) => (
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

				{comboboxInputProps.value && renderCreateListItem
					? renderCreateListItem({
							closeMenu,
							inputValue: comboboxInputProps.value,
						})
					: null}
			</Menu>

			{helperText ? (
				<Text size={1} id={helperTextId}>
					{helperText}
				</Text>
			) : null}
		</ControlLabel>
	);
}
