"use client";

import { clsx } from "clsx";
import {
	type ComponentProps,
	type ReactNode,
	useLayoutEffect,
	useRef,
} from "react";
import { Dialog } from "@/ui/Dialog";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Lightbox } from "@/ui/Lightbox";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function Alert({
	actions,
	children,
	className,
	heading,
	notice,
	ref,
	...props
}: Partial<ComponentProps<typeof Dialog>> & {
	actions?: ReactNode;
	notice?: ReactNode;
	heading?: ReactNode;
}) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useLayoutEffect(() => {
		/**
		 * Dialogs must be opened with `showModal`, or they don't render ::backdrop.
		 * Don't act if an external ref is provided, assume it's handled by the
		 * implementing component.
		 */
		if (dialogRef.current && !ref) {
			dialogRef.current.showModal();
		}
	}, [ref]);

	return (
		<Dialog ref={ref ?? dialogRef} {...props}>
			<Lightbox className={clsx(className, styles.lightbox)}>
				<div
					className={clsx(styles.contain, {
						[styles.hasNotice]: Boolean(notice),
					})}
				>
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
			</Lightbox>
		</Dialog>
	);
}
