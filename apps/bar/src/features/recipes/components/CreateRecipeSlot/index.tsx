import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentProps } from "react";
import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function CreateRecipeSlot({
	className,
	...props
}: Partial<ComponentProps<typeof Link>>) {
	return (
		<Link
			href="/bar/recipes/create"
			className={clsx(className, styles.slot)}
			{...props}
		>
			<Flex gap={2} alignItems="center">
				<Icon name="plus" size={3} />

				<Text as="div" size={3} heavy weight={600} compact>
					Create Recipe
				</Text>
			</Flex>
		</Link>
	);
}
