"use client";

import clsx from "clsx";
import { useSelect } from "downshift";
import { Button } from "@/ui/Button";
import { ControlLabel } from "@/ui/ControlLabel";
import { Icon } from "@/ui/Icon";
import { Lightbox } from "@/ui/Lightbox";
import { Text } from "@/ui/Text";
import { KEY_NAME, type WithKey } from "@/utils/withKey";
import styles from "./styles.module.css";

type Props<T> = {
	className?: string;
	footer?: React.ReactNode;
	getItemLabel?: (item: WithKey<T>) => React.ReactNode;
	getItemValue: (item: WithKey<T>) => string;
	items: WithKey<T>[];
	itemToString: (item: WithKey<T> | null) => string;
	label?: React.ReactNode;
	name: string;
	placeholder?: React.ReactNode;
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
	footer,
	getItemLabel,
	getItemValue,
	items,
	itemToString,
	label,
	name,
	placeholder,
}: Props<T>) {
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
		defaultSelectedItem: undefined,
		itemToString,
	});

	return (
		<ControlLabel
			{...getLabelProps()}
			label={label}
			className={clsx(styles.base, className)}
		>
			<div className={styles.contain}>
				<Button
					variant="outline"
					color="light"
					{...getToggleButtonProps()}
					className={clsx(styles.button, {
						[styles.hasValue]: Boolean(selectedItem),
					})}
				>
					{selectedItem
						? itemToString(selectedItem)
						: (placeholder ?? "Select…")}
				</Button>

				<div {...getMenuProps()}>
					<input
						type="hidden"
						name={name}
						value={selectedItem ? getItemValue(selectedItem) : ""}
					/>

					{isOpen ? (
						<Lightbox className={styles.lightbox}>
							<ul className={styles.options}>
								{items.map((item, index) => (
									<li
										key={item[KEY_NAME]}
										className={clsx(styles.item, {
											[styles.isHighlighted]: highlightedIndex === index,
										})}
										{...getItemProps({ item, index })}
									>
										<div className={styles.label}>
											{getItemLabel ? (
												getItemLabel(item)
											) : (
												<Text size={3} heavy>
													{itemToString(item)}
												</Text>
											)}
										</div>

										{selectedItem &&
										getItemValue(selectedItem) === getItemValue(item) ? (
											<div className={styles.icon}>
												<Icon name="check" />
											</div>
										) : null}
									</li>
								))}
							</ul>

							{footer ? <div className={styles.footer}>{footer}</div> : null}
						</Lightbox>
					) : null}
				</div>
			</div>
		</ControlLabel>
	);
}
