"use client";

import { clsx } from "clsx";
import type { ComponentProps } from "react";
import type { IconName } from "@/libs/icons/types";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import type { Keyed } from "@/utils/withKey";
import styles from "./styles.module.css";

export function OptionsSwitch<T extends string>({
	className,
	legend,
	name,
	options,
	value,
	...inputProps
}: {
	name: string;
	value?: T;
	className?: string;
	legend?: string;
	options: Keyed<{
		label?: string;
		value: T;
		icon?: IconName;
	}>[];
} & Omit<ComponentProps<"input">, "type" | "value" | "className">) {
	return (
		<fieldset className={clsx(styles.fieldset, className)}>
			{legend ? (
				<Text as="legend" size={2} weight={500} className="sr-only">
					{legend}
				</Text>
			) : null}

			<div role="radiogroup" className={styles.group}>
				{options.map(({ value: optionValue, label, icon }) => (
					<label key={optionValue} className={styles.label}>
						<input
							type="radio"
							name={name}
							value={optionValue}
							aria-label={label}
							title={label}
							checked={value != null ? value === optionValue : undefined}
							className="sr-only"
							{...inputProps}
						/>

						{icon ? <Icon name={icon} className={styles.icon} /> : null}

						{label ? label : null}
					</label>
				))}
			</div>
		</fieldset>
	);
}
