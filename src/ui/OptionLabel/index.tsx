import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function OptionLabel({
	children,
	className,
	description,
	secondary,
	...props
}: ComponentProps<typeof Text> & {
	description?: React.ReactNode;
	secondary?: React.ReactNode;
}) {
	return (
		<>
			<Text
				as="div"
				compact
				heavy
				weight={500}
				className={clsx(styles.label, className)}
				{...props}
			>
				{children}

				{secondary ? (
					<Text as="span" size={1} compact light>
						{secondary}
					</Text>
				) : null}
			</Text>

			{description ? (
				<Text as="div" size={1} compact light className={styles.description}>
					{description}
				</Text>
			) : null}
		</>
	);
}
