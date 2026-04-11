import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Flex } from "@/ui/Flex";
import styles from "./styles.module.css";

export function ButtonGroup({
	className,
	...props
}: ComponentProps<typeof Flex>) {
	return <Flex {...props} className={clsx(styles.group, className)} />;
}
