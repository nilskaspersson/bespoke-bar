import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Flex } from "@/ui/Flex";
import styles from "./styles.module.css";

type Props = {
	children: ReactNode;
};

export function RecipeListActions({
	children,
	className,
	...props
}: Props & ComponentProps<typeof Flex>) {
	return (
		<Flex
			justifyContent="center"
			alignItems="center"
			gap={2}
			{...props}
			className={clsx(styles.dock, className)}
		>
			{children}
		</Flex>
	);
}
