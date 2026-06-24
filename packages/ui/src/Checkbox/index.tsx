import { clsx } from "clsx";
import { type InputHTMLAttributes, useId } from "react";
import { Icon } from "../Icon";
import { Text } from "../Text";
import type { Scale } from "../utils/types";
import styles from "./styles.module.css";

type CheckboxSize = "small" | "regular" | "large";

const TEXT_SIZE_MAP = new Map<CheckboxSize, Scale>([
	["small", 1],
	["regular", 2],
	["large", 5],
]);

const ICON_SIZE_MAP = new Map<CheckboxSize, Scale>([
	["small", 1],
	["regular", 4],
	["large", 6],
]);

export function Checkbox({
	className,
	id,
	label,
	type = "checkbox",
	size = "regular",
	...inputProps
}: Omit<
	InputHTMLAttributes<HTMLInputElement>,
	"className" | "type" | "size"
> & {
	className?: string;
	label: React.ReactNode;
	type?: "checkbox" | "radio";
	size?: CheckboxSize;
}) {
	const localId = useId();
	const inputId = id ?? localId;

	const isRadio = type === "radio";

	return (
		<div
			className={clsx(className, styles.base, styles[size], {
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
				size={TEXT_SIZE_MAP.get(size) ?? 2}
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
						size={ICON_SIZE_MAP.get(size) ?? 4}
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
