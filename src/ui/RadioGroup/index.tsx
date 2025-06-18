import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";
import { Checkbox } from "@/ui/Checkbox";
import { Text } from "@/ui/Text";
import { KEY_NAME, type WithKey } from "@/utils/withKey";
import styles from "./styles.module.css";

export type Option = {
	label: string;
	value: string;
};

export function RadioGroup({
	className,
	legend,
	options,
	id,
	...inputProps
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value"> & {
	legend: React.ReactNode;
	name: string;
	options: WithKey<Option>[] | null | undefined;
}) {
	return (
		<fieldset className={clsx(className, styles.fieldset)} id={id}>
			<div>
				<Text
					size={2}
					as="legend"
					weight={500}
					compact
					heavy
					className={clsx({ required: inputProps.required })}
				>
					{legend}
				</Text>
			</div>

			{options?.map((option) => (
				<Checkbox
					key={option[KEY_NAME]}
					type="radio"
					label={option.label}
					value={option.value}
					{...inputProps}
				/>
			))}
		</fieldset>
	);
}
