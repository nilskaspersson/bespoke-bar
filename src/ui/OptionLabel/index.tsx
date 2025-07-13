import type { ComponentProps } from "react";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function OptionLabel({
	children,
	description,
	...props
}: ComponentProps<typeof Text> & { description?: React.ReactNode }) {
	return (
		<>
			<Text as="div" compact heavy weight={500} {...props}>
				{children}
			</Text>

			{description ? (
				<Text as="div" size={1} compact className={styles.description}>
					{description}
				</Text>
			) : null}
		</>
	);
}
