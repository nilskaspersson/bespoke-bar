import type { ReactNode } from "react";
import type { IconName } from "@/libs/icons/types";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
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
