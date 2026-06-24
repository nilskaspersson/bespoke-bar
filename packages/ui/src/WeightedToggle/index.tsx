"use client";

import { getKey } from "@bespoke/domain/utils/withKey";
import type { Keyed } from "@bespoke/schema/types";
import { clsx } from "clsx";
import type { ChangeEvent, ComponentProps, ReactNode } from "react";
import styles from "./styles.module.css";

type Group = {
	label: string;
	options: Keyed<Option>[];
};

type Option = {
	label: string;
	value: string;
};

type ItemProps = {
	option: Keyed<Option>;
	name: string;
	isChecked: boolean;
	onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

function Item({ option, name, isChecked, onChange }: ItemProps) {
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

export function WeightedToggle({
	className,
	defaultValue,
	groups,
	legend,
	name,
	onChange,
	...fieldsetProps
}: Omit<ComponentProps<"fieldset">, "children" | "onChange"> & {
	defaultValue?: Option["value"];
	groups: Keyed<Group>[];
	legend?: ReactNode;
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
						<div key={getKey(group)} className={styles.group}>
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
												key={getKey(option)}
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
