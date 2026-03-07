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
import { useOnNavigation } from "@/hooks/useOnNavigation";
import { Button } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { getWindowHeight, onMotionValueReached } from "@/utils/animate";
import styles from "./styles.module.css";

export type DrawerHandle = {
	showModal: () => void;
	close: () => void;
};

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
	| "ref"
	| "onDrag"
	| "onDragEnd"
	| "onDragStart"
	| "onAnimationStart"
	| "onAnimationEnd"
> &
	DrawerProps & { ref?: React.Ref<DrawerHandle> }) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const motionRef = useRef<HTMLDivElement>(null);
	const closingRef = useRef(false);

	/**
	 * Initialize y to DORMANT_Y to avoid hydration mismatches.
	 */
	const y = useMotionValue(DORMANT_Y);

	const backdropOpacity = useTransform(y, deriveBackdropOpacity);
	const visibility = useTransform(y, deriveVisibility);

	/**
	 * Expose showModal/close as an imperative handle. showModal includes the entry
	 * animation since m.dialog doesn't forward the native toggle event.
	 * TODO: Rework once Motion dialogs support onToggle?
	 */
	useImperativeHandle(ref, () => ({
		showModal() {
			const dialog = dialogRef.current;
			if (!dialog || dialog.open) return;
			dialog.showModal();
			y.jump(getWindowHeight());
			animateValue(y, 0, SPRING_BOUNCY);
		},
		close() {
			handleClose();
		},
	}));

	useOnNavigation(handleClose);

	async function handleClose() {
		const dialog = dialogRef.current;

		if (!dialog?.open || closingRef.current) return;
		closingRef.current = true;

		const offscreen = motionRef.current?.offsetHeight ?? getWindowHeight();
		animateValue(y, offscreen, SPRING);

		await onMotionValueReached(y, offscreen);

		y.jump(DORMANT_Y);
		dialog.close();
		closingRef.current = false;
	}

	function handleBackdropClick(e: React.MouseEvent) {
		if (e.target === dialogRef.current) {
			handleClose();
		}
	}

	function handleDragEnd(_: unknown, info: PanInfo) {
		if (shouldDragClose(info.offset.y, info.velocity.y)) {
			handleClose();
		} else {
			/**
			 * Initialize with current drag velocity
			 */
			animateValue(y, 0, { ...SPRING, velocity: info.velocity.y });
		}
	}

	return (
		<m.dialog
			ref={dialogRef}
			className={clsx(styles.drawer, className)}
			style={{ ...style, "--backdrop-opacity": backdropOpacity }}
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
