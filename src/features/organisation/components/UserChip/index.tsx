import type { PublicUserData } from "@clerk/types";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Avatar } from "@/ui/Avatar";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function UserChip({
	user,
	className,
	...props
}: {
	user: PublicUserData | null | undefined;
} & Omit<ComponentProps<"span">, "children">) {
	if (!user) {
		return "Unknown user";
	}

	return (
		<span className={clsx(styles.chip, className)} {...props}>
			<Avatar user={user} className={styles.avatar} />

			<Text
				truncate
				compact
				size={2}
				title={`${user.firstName} ${user.lastName}`}
				className={styles.text}
				weight={500}
			>
				{user.firstName} {user.lastName?.slice(0, 1)}
			</Text>
		</span>
	);
}
