"use client";

import type { ComponentProps } from "react";
import { Chip } from "@/ui/Chip";
import { Flex } from "@/ui/Flex";
import styles from "./styles.module.css";

export function TagRadioGroup({
	name,
	options,
	chipProps,
}: {
	value?: number;
	name: string;
	onChange?: (value: number) => void;
	options: {
		label: string;
		value: string;
	}[];
	chipProps?: Omit<ComponentProps<typeof Chip>, "as">;
}) {
	return (
		<Flex className={styles.base} role="radiogroup" gap={2}>
			{options.map(({ value: optionValue, label }) => {
				return (
					<Chip
						as="label"
						key={optionValue}
						className={styles.label}
						color="accent"
						{...chipProps}
					>
						<input
							type="radio"
							name={name}
							value={optionValue}
							aria-label={label}
							title={label}
							className="sr-only"
						/>

						{label}
					</Chip>
				);
			})}
		</Flex>
	);
}
