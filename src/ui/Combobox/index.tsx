"use client";

import { clsx } from "clsx";
import { type UseComboboxProps, useCombobox } from "downshift";
import {
	type ComponentProps,
	useDeferredValue,
	useId,
	useMemo,
	useState,
} from "react";
import { Button } from "@/ui/Button";
import { ControlLabel } from "@/ui/ControlLabel";
import { Icon } from "@/ui/Icon";
import { Input } from "@/ui/Input";
import { OptionItem } from "@/ui/OptionItem";
import { OptionsList } from "@/ui/OptionsList";
import { Text } from "@/ui/Text";
import { getKey, type Keyed } from "@/utils/withKey";
import styles from "./styles.module.css";

type Props<T> = {
	className?: string;
	clearable?: boolean;
	footer?: React.ReactNode;
	defaultValue?: string;
	getItemLabel?: (item: Keyed<T>) => React.ReactNode;
	getItemValue: (item: Keyed<T>) => string;
	header?: React.ReactNode;
	items: Keyed<T>[];
	itemToString: (item: Keyed<T> | null) => string;
	label?: React.ReactNode;
	name: string;
	helperText?: React.ReactNode;
	comboboxProps?: Partial<UseComboboxProps<Keyed<T>>>;
	inputProps?: Pick<
		ComponentProps<typeof Input>,
		"className" | "compact" | "pill" | "rounded"
	>;
};

export function Combobox<T>({
	className,
	clearable = true,
	comboboxProps,
	defaultValue,
	footer,
	getItemLabel,
	getItemValue,
	header,
	helperText,
	inputProps,
	items,
	itemToString,
	label,
	name,
}: Props<T>) {
	const helperTextId = useId();

	const [inputValue, setInputValue] = useState<string | null>(null);
	const deferredInputValue = useDeferredValue<typeof inputValue>(inputValue);

	const filteredItems = useMemo(() => {
		const normalizeLabel = (item: Keyed<T>) => itemToString(item).toLowerCase();

		return deferredInputValue
			? items.filter((o) =>
					normalizeLabel(o).includes(deferredInputValue ?? ""),
				)
			: items;
	}, [deferredInputValue, items, itemToString]);

	const {
		isOpen,
		getToggleButtonProps,
		getLabelProps,
		getMenuProps,
		getInputProps,
		highlightedIndex,
		getItemProps,
		selectedItem,
		reset,
	} = useCombobox({
		onInputValueChange({ inputValue }) {
			setInputValue(inputValue.trim().toLowerCase());
		},
		items: filteredItems,
		itemToString,
		defaultSelectedItem: defaultValue
			? items.find((o) => getItemValue(o) === defaultValue)
			: undefined,
		scrollIntoView: (node) =>
			node?.scrollIntoView({ behavior: "instant", block: "nearest" }),
		...comboboxProps,
	});

	const comboboxInputProps = getInputProps();

	return (
		<ControlLabel
			{...getLabelProps()}
			label={label}
			className={clsx(styles.base, className)}
		>
			<div className={styles.contain}>
				<Input
					{...inputProps}
					{...comboboxInputProps}
					title={comboboxInputProps.value}
					type="search"
					className={clsx(styles.input, inputProps?.className, {
						[styles.compact]: inputProps?.compact,
					})}
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
						className={clsx(styles.toggle, {
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

				<div {...getMenuProps()}>
					<input
						type="hidden"
						name={name}
						value={selectedItem ? getItemValue(selectedItem) : ""}
					/>

					{isOpen && filteredItems.length > 0 ? (
						<OptionsList footer={footer} header={header}>
							{filteredItems.map((item, index) => (
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
