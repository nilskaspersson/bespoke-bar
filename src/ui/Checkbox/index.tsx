import { clsx } from "clsx";
import { type InputHTMLAttributes, useId } from "react";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function Checkbox({
	className,
	id,
	label,
	type = "checkbox",
	...inputProps
}: Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type"> & {
	className?: string;
	label: React.ReactNode;
	type?: "checkbox" | "radio";
}) {
	const localId = useId();

	const inputId = id ?? localId;

	const isRadio = type === "radio";

	return (
		<div
			className={clsx(className, styles.base, {
				[styles.isDisabled]: inputProps.disabled,
			})}
		>
			<input
				{...inputProps}
				type={type ?? "checkbox"}
				className={styles.input}
				id={inputId}
			/>

			<Text
				size={2}
				as="label"
				weight={500}
				compact
				htmlFor={inputId}
				className={styles.label}
			>
				<div className={clsx(styles.box, { [styles.radio]: isRadio })}>
					<Icon
						name={type === "checkbox" ? "check" : "circle-small"}
						className={styles.icon}
						size="large"
					/>
				</div>

				<span
					className={clsx(styles.text, {
						required: inputProps.required && !isRadio,
					})}
				>
					<span className={styles.inner}>{label}</span>
				</span>
			</Text>
		</div>
	);
}
