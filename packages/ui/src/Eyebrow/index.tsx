import type { ReactNode } from "react";
import { Icon } from "../Icon";
import type { IconName } from "../icons/types";
import { Text } from "../Text";
import styles from "./styles.module.css";

type Props = {
	icon?: IconName;
	children: ReactNode;
};

export function Eyebrow({ icon, children }: Props) {
	return (
		<span className={styles.eyebrow}>
			{icon ? <Icon name={icon} size={2} /> : null}

			<Text size={3} weight={700} noWrap className={styles.label}>
				{children}
			</Text>
		</span>
	);
}
