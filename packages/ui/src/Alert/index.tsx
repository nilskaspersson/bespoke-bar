"use client";

import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Dialog } from "../Dialog";
import { Heading } from "../Heading";
import { Icon } from "../Icon";
import { Lightbox } from "../Lightbox";
import { Text } from "../Text";
import type { SystemColor } from "../utils/types";
import styles from "./styles.module.css";

export function Alert({
	actions,
	children,
	className,
	heading,
	notice,
	color = "regular",
	...props
}: ComponentProps<typeof Dialog> & {
	actions?: ReactNode;
	notice?: ReactNode;
	heading?: ReactNode;
	color?: SystemColor;
}) {
	return (
		<Dialog {...props}>
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
					<Text
						as="div"
						fullWidth
						compact
						size={2}
						className={clsx(styles.notice, styles[color])}
					>
						<Icon name="circle-exclamation" className={styles.icon} />
						<span>{notice}</span>
					</Text>
				) : null}

				{actions ? <footer className={styles.actions}>{actions}</footer> : null}
			</Lightbox>
		</Dialog>
	);
}
