"use client";

import { clsx } from "clsx";
import {
	type ComponentPropsWithoutRef,
	type ReactNode,
	useLayoutEffect,
	useRef,
} from "react";
import { Dialog } from "@/ui/Dialog";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Noise } from "@/ui/Noise";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function Alert({
	actions,
	children,
	className,
	heading,
	notice,
	...props
}: ComponentPropsWithoutRef<typeof Dialog> & {
	actions?: ReactNode;
	notice: ReactNode;
	heading?: ReactNode;
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
				<Noise />

				<div className={styles.contain}>
					{heading ? (
						<Heading level="h6" className={styles.heading}>
							{heading}
						</Heading>
					) : null}

					<div className={styles.content}>{children}</div>
				</div>

				{notice ? (
					<Text as="div" fullWidth compact size={2} className={styles.notice}>
						<Icon name="circle-exclamation" className={styles.icon} />

						<span>{notice}</span>
					</Text>
				) : null}

				{actions ? <footer className={styles.actions}>{actions}</footer> : null}
			</div>
		</Dialog>
	);
}
