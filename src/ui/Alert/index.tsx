"use client";

import { clsx } from "clsx";
import {
	type ComponentPropsWithoutRef,
	type ReactNode,
	useLayoutEffect,
	useRef,
} from "react";
import { Dialog } from "@/ui/Dialog";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function Alert({
	actions,
	children,
	className,
	notice,
	...props
}: ComponentPropsWithoutRef<typeof Dialog> & {
	actions?: ReactNode;
	notice: ReactNode;
}) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useLayoutEffect(() => {
		if (dialogRef) {
			/**
			 * Dialogs must be opened with `showModal`, or they don't render ::backdrop
			 */
			dialogRef.current?.showModal();
		}
	}, []);

	return (
		<Dialog ref={dialogRef} {...props}>
			<div className={clsx(className, styles.lightbox)}>
				<div className={styles.contain}>
					<div className={styles.content}>{children}</div>

					{notice ? (
						<div className={styles.notice}>
							<Icon name="circle-exclamation" className={styles.icon} />
							<Text>{notice}</Text>
						</div>
					) : null}
				</div>

				{actions ? <footer className={styles.footer}>{actions}</footer> : null}
			</div>
		</Dialog>
	);
}
