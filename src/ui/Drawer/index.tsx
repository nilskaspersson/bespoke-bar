"use client";

import { clsx } from "clsx";
import {
	animate as animateValue,
	m,
	type PanInfo,
	type Transition,
	useMotionValue,
	useTransform,
} from "motion/react";
import {
	type ComponentProps,
	type ReactNode,
	useImperativeHandle,
	useRef,
} from "react";
import { Button } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { onMotionValueReached } from "@/utils/animate";
import styles from "./styles.module.css";

type DrawerProps = {
	actions?: ReactNode;
	header?: ReactNode;
};

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

function deriveBackdropOpacity(y: number): number {
	return Math.max(0, Math.min(1, 1 - y / window.innerHeight));
}

function deriveVisibility(y: number): "hidden" | "visible" {
	return y >= window.innerHeight - 1 ? "hidden" : "visible";
}

function shouldDragClose(offset: number, velocity: number): boolean {
	const movingDown = velocity > REVERSAL_VELOCITY_THRESHOLD;
	return (
		movingDown &&
		(offset > CLOSE_OFFSET_THRESHOLD || velocity > CLOSE_VELOCITY_THRESHOLD)
	);
}

export function Drawer({
	children,
	actions,
	header,
	className,
	style,
	ref,
	...props
}: Omit<
	ComponentProps<"dialog">,
	"onDrag" | "onDragEnd" | "onDragStart" | "onAnimationStart" | "onAnimationEnd"
> &
	DrawerProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const motionRef = useRef<HTMLDivElement>(null);
	const closingRef = useRef(false);

	/**
	 * Expose the internal dialog element to parent refs. Needed because the Drawer
	 * manages its own ref for close animations and open detection, but consumers
	 * (e.g. useDialog) need access to call showModal().
	 */
	useImperativeHandle(ref, () => {
		if (!dialogRef.current) {
			throw new Error("Drawer dialog ref accessed before mount");
		}

		return dialogRef.current;
	});

	/**
	 * The major motion value for the drawer.
	 */
	const y = useMotionValue(
		typeof window !== "undefined" ? window.innerHeight : 0,
	);

	const backdropOpacity = useTransform(y, deriveBackdropOpacity);
	const visibility = useTransform(y, deriveVisibility);

	async function handleClose() {
		const dialog = dialogRef.current;

		if (!dialog?.open || closingRef.current) return;
		closingRef.current = true;

		const offscreen = motionRef.current?.offsetHeight ?? window.innerHeight;
		animateValue(y, offscreen, SPRING);

		await onMotionValueReached(y, offscreen);

		y.jump(window.innerHeight);
		dialog.close();
		closingRef.current = false;
	}

	function handleToggle(e: React.ToggleEvent<HTMLDialogElement>) {
		if (e.newState === "open") {
			y.jump(window.innerHeight);
			animateValue(y, 0, SPRING_BOUNCY);
		}
	}

	function handleBackdropClick(e: React.MouseEvent) {
		if (e.target === dialogRef.current) handleClose();
	}

	function handleDragEnd(_: unknown, info: PanInfo) {
		if (shouldDragClose(info.offset.y, info.velocity.y)) {
			handleClose();
		} else {
			animateValue(y, 0, { ...SPRING, velocity: info.velocity.y });
		}
	}

	return (
		<m.dialog
			ref={dialogRef}
			className={clsx(styles.drawer, className)}
			style={{ ...style, "--backdrop-opacity": backdropOpacity }}
			onToggle={handleToggle}
			onCancel={(e) => {
				e.preventDefault();
				handleClose();
			}}
			onClick={handleBackdropClick}
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
		</m.dialog>
	);
}
