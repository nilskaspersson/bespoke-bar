import { clsx } from "clsx";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function ControlLabel(props: {
	className?: string;
	label: React.ReactNode;
	children: React.ReactNode;
	required?: boolean;
	htmlFor: string;
	id: string;
}) {
	return (
		<div className={clsx(styles.base, props.className)}>
			<Text
				id={props.id}
				as="label"
				size={2}
				weight={500}
				compact
				htmlFor={props.htmlFor}
				className={clsx(styles.label, {
					required: props.required,
				})}
			>
				<span className={styles.text}>{props.label}</span>
			</Text>

			{props.children}
		</div>
	);
}
