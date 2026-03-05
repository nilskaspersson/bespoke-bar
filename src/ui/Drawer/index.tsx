"use client";

import { clsx } from "clsx";
import {
	animate as animateValue,
	m,
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

const CLOSE_OFFSET_THRESHOLD = 100;
const CLOSE_VELOCITY_THRESHOLD = 500;

export function Drawer({
	children,
	actions,
	header,
	className,
	ref,
	...props
}: Omit<
	ComponentProps<"dialog">,
	"onDrag" | "onDragEnd" | "onDragStart" | "onAnimationStart" | "onAnimationEnd"
> &
	DrawerProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement);
	const motionRef = useRef<HTMLDivElement>(null);
	const offscreenRef = useRef(window.innerHeight);
	const y = useMotionValue(window.innerHeight);
	const backdropOpacity = useTransform(y, (v) => {
		const offscreen = offscreenRef.current;
		return offscreen > 0 ? 1 - Math.min(1, v / offscreen) : 0;
	});
	const motionVisibility = useTransform(y, (v) =>
		v >= offscreenRef.current - 1 ? "hidden" : "visible",
	);

	function measureOffscreen() {
		offscreenRef.current =
			motionRef.current?.offsetHeight ?? window.innerHeight;
		return offscreenRef.current;
	}

	function animateClose() {
		const dialog = dialogRef.current;
		if (!dialog?.open) return;

		const offscreen = measureOffscreen();
		animateValue(y, offscreen, SPRING);

		const unsub = y.on("change", (v) => {
			if (typeof v === "number" && v >= offscreen - 1) {
				unsub();
				y.jump(window.innerHeight);
				dialog.close();
			}
		});
	}

	function handleToggle(e: React.ToggleEvent<HTMLDialogElement>) {
		if (e.newState === "open") {
			const offscreen = window.innerHeight;
			offscreenRef.current = offscreen;
			y.jump(offscreen);
			animateValue(y, 0, SPRING_BOUNCY);
		}
	}

	function handleCancel(e: React.SyntheticEvent<HTMLDialogElement>) {
		e.preventDefault();
		animateClose();
	}

	function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
		if (e.target === dialogRef.current) {
			animateClose();
		}
	}

	function handleDragEnd(
		_: unknown,
		info: { offset: { y: number }; velocity: { y: number } },
	) {
		if (
			info.offset.y > CLOSE_OFFSET_THRESHOLD ||
			info.velocity.y > CLOSE_VELOCITY_THRESHOLD
		) {
			animateClose();
		} else {
			animateValue(y, 0, SPRING);
		}
	}

	return (
		<m.dialog
			ref={dialogRef}
			className={clsx(styles.drawer, className)}
			style={{ "--backdrop-opacity": backdropOpacity } as React.CSSProperties}
			onToggle={handleToggle}
			onCancel={handleCancel}
			onClick={handleBackdropClick}
			{...props}
		>
			<m.div
				ref={motionRef}
				className={styles.motion}
				style={{ y, visibility: motionVisibility }}
				drag="y"
				dragConstraints={{ top: 0 }}
				dragElastic={{ top: 0.15, bottom: 0 }}
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
									onClick={() => animateClose()}
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
