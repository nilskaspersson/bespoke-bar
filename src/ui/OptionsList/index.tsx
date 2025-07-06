import { clsx } from "clsx";

import type { ComponentProps } from "react";
import { Lightbox } from "@/ui/Lightbox";
import styles from "./styles.module.css";

export function OptionsList({
	className,
	children,
	footer,
	header,
	...props
}: ComponentProps<typeof Lightbox> & {
	footer?: React.ReactNode;
	header?: React.ReactNode;
}) {
	return (
		<Lightbox
			{...props}
			className={clsx(styles.lightbox, className)}
			translucent
		>
			{header ? <div className={styles.header}>{header}</div> : null}
			<ul className={styles.options}>{children}</ul>
			{footer ? <div className={styles.footer}>{footer}</div> : null}
		</Lightbox>
	);
}
