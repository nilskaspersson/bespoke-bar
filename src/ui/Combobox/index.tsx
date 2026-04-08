"use client";
"use no memo";

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
		selectItem,
	} = useCombobox({
		...comboboxProps,
		onInputValueChange({ inputValue, type }) {
			/**
			 * Clear the selection on input. This enables a "free" input mode, where the search
			 * can be used as a member of the form.
			 */
			if (
				type === useCombobox.stateChangeTypes.InputChange &&
				Boolean(selectedItem) &&
				inputValue !== itemToString(selectedItem)
			) {
				selectItem(null);
			}

			setInputValue(inputValue.trim().toLowerCase());

			comboboxProps?.onInputValueChange?.({ inputValue, type });
		},
		items: filteredItems,
		itemToString,
		/**
		 * Fallback to null to avoid switching between controlled/uncontrolled state.
		 */
		selectedItem:
			value !== undefined
				? (items.find((o) => getItemValue(o) === value) ?? null)
				: undefined,
		defaultSelectedItem: defaultValue
			? items.find((o) => getItemValue(o) === defaultValue)
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
			<div className={styles.contain} id={id}>
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

				<div {...getMenuProps()}>
					<input
						type="hidden"
						name={name}
						value={selectedItem ? getItemValue(selectedItem) : ""}
					/>

					{isOpen ? (
						<OptionsList
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
							header={header}
						>
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

							{Boolean(comboboxInputProps.value) && renderCreateListItem
								? renderCreateListItem({
										closeMenu,
										inputValue: comboboxInputProps.value,
									})
								: null}
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
