"use client";

import { clsx } from "clsx";
import {
	animate as animateValue,
	m,
	type PanInfo,
	type Transition,
	useMotionValue,
	useMotionValueEvent,
	useTransform,
} from "motion/react";
import { type ComponentProps, type ReactNode, useEffect, useRef } from "react";
import { Button } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Dialog } from "@/ui/Dialog";
import { getWindowHeight, onMotionValueReached } from "@/utils/animate";
import styles from "./styles.module.css";

const SPRING: Transition = {
	type: "spring",
	duration: 0.35,
	bounce: 0,
};

const SPRING_BOUNCY: Transition = {
	type: "spring",
	duration: 0.5,
	bounce: 0.15,
};

const DRAG_CONSTRAINTS = { top: 0 } as const;
const DRAG_ELASTIC = { top: 0.15, bottom: 0 } as const;

const CLOSE_OFFSET_THRESHOLD = 100;
const CLOSE_VELOCITY_THRESHOLD = 500;
const REVERSAL_VELOCITY_THRESHOLD = -20;

/**
 * Sentinel y value for dormant (closed) drawers. Large enough to always
 * derive hidden visibility and zero backdrop opacity on both server and client.
 */
const DORMANT_Y = 100_000;

function deriveBackdropOpacity(y: number): number {
	const height = getWindowHeight();
	return height > 0 ? Math.max(0, Math.min(1, 1 - y / height)) : 0;
}

function deriveVisibility(y: number): "hidden" | "visible" {
	const height = getWindowHeight();
	return height === 0 || y >= height - 1 ? "hidden" : "visible";
}

function shouldDragClose(offset: number, velocity: number): boolean {
	const movingDown = velocity > REVERSAL_VELOCITY_THRESHOLD;
	return (
		movingDown &&
		(offset > CLOSE_OFFSET_THRESHOLD || velocity > CLOSE_VELOCITY_THRESHOLD)
	);
}

type DrawerProps = {
	actions?: ReactNode;
	header?: ReactNode;
	isOpen?: boolean;
	mounted?: boolean;
	onExitComplete?: () => void;
	ref: React.RefObject<HTMLDialogElement | null>;
};

export function Drawer({
	children,
	actions,
	header,
	className,
	ref,
	isOpen = false,
	mounted,
	onExitComplete,
	...props
}: ComponentProps<typeof Dialog> & DrawerProps) {
	const motionRef = useRef<HTMLDivElement>(null);
	const closingRef = useRef(false);

	const y = useMotionValue(DORMANT_Y);
	const backdropOpacity = useTransform(y, deriveBackdropOpacity);
	const visibility = useTransform(y, deriveVisibility);

	useMotionValueEvent(backdropOpacity, "change", (v) => {
		ref.current?.style.setProperty("--progress", String(v));
	});

	useEffect(() => {
		if (isOpen) {
			y.jump(getWindowHeight());
			animateValue(y, 0, SPRING_BOUNCY);
		}
	}, [isOpen, y]);

	async function handleClose() {
		if (!ref.current?.open || closingRef.current) {
			return;
		}

		closingRef.current = true;

		const offscreen = getWindowHeight();
		animateValue(y, offscreen, SPRING);

		await onMotionValueReached(y, offscreen);

		y.jump(DORMANT_Y);
		ref.current?.close();
		closingRef.current = false;
		onExitComplete?.();
	}

	function handleDragEnd(_: unknown, info: PanInfo) {
		if (shouldDragClose(info.offset.y, info.velocity.y)) {
			handleClose();
		} else {
			animateValue(y, 0, { ...SPRING, velocity: info.velocity.y });
		}
	}

	return (
		<Dialog
			ref={ref}
			isOpen={mounted}
			withBlur={false}
			className={clsx(styles.drawer, className)}
			onCancel={(event) => {
				if (event.target !== event.currentTarget) return;
				event.preventDefault();
				handleClose();
			}}
			{...props}
		>
			<m.div
				ref={motionRef}
				className={styles.motion}
				style={{ y, visibility }}
				drag="y"
				dragConstraints={DRAG_CONSTRAINTS}
				dragElastic={DRAG_ELASTIC}
				onDragEnd={handleDragEnd}
			>
				<Container className={styles.container} padding={false}>
					{header ? <header className={styles.header}>{header}</header> : null}

					<div className={styles.content}>{children}</div>

					<footer className={styles.footer}>
						<menu className={styles.actions}>
							<li>
								<Button
									type="button"
									variant="ghost"
									size="tiny"
									onClick={handleClose}
								>
									Cancel
								</Button>
							</li>

							{actions}
						</menu>
					</footer>
				</Container>
			</m.div>
		</Dialog>
	);
}
