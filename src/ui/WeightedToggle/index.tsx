"use client";

import clsx from "clsx";
import type { ChangeEvent, ComponentProps } from "react";
import { KEY_NAME, type WithKey } from "@/utils/withKey";
import styles from "./styles.module.css";

type Group<T> = {
	label: string;
	options: T[];
};

type Option = {
	label: string;
	value: string;
};

type ItemProps<T extends WithKey<Option>> = {
	option: T;
	name: string;
	isChecked: boolean;
	onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

function Item<T extends WithKey<Option>>({
	option,
	name,
	isChecked,
	onChange,
}: ItemProps<T>) {
	return (
		<label className={styles.item}>
			<input
				name={name}
				type="radio"
				value={option.value}
				defaultChecked={isChecked}
				onChange={onChange}
				className={styles.input}
			/>

			<span className={styles.value}>{option.label}</span>
		</label>
	);
}

export function WeightedToggle<T extends WithKey<Option>>({
	className,
	defaultValue,
	groups,
	legend,
	name,
	onChange,
	...fieldsetProps
}: Omit<ComponentProps<"fieldset">, "children" | "onChange"> & {
	defaultValue?: T["value"];
	groups: WithKey<Group<T>>[];
	legend?: React.ReactNode;
	name: string;
	onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
	return (
		<fieldset className={clsx(className, styles.fieldset)} {...fieldsetProps}>
			{legend}

			<div className={styles.options}>
				{groups.map((group) => {
					const isSingle = group.options.length === 1;

					return (
						<div key={group[KEY_NAME]} className={styles.group}>
							{isSingle ? (
								<div className={styles.single}>
									<Item
										option={group.options[0]}
										name={name}
										isChecked={group.options[0].value === defaultValue}
										onChange={onChange}
									/>
								</div>
							) : (
								<div className={styles.multiple}>
									<div className={styles.groupLabel}>
										<span className={styles.groupLabelText}>{group.label}</span>
									</div>

									<div className={styles.items}>
										{group.options.map((option) => (
											<Item
												key={option[KEY_NAME]}
												option={option}
												name={name}
												isChecked={option.value === defaultValue}
												onChange={onChange}
											/>
										))}
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</fieldset>
	);
}
