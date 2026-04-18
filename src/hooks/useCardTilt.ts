"use client";

import { type MotionStyle, useReducedMotion, useSpring } from "motion/react";
import { type MouseEvent, useCallback, useRef } from "react";

type TiltOptions = {
	/**
	 * Total tilt sweep across each axis in degrees. Each side of
	 * center receives up to `maxTilt / 2`, so the default of 15
	 * tips the card 7.5° toward each edge.
	 */
	maxTilt?: number;
	stiffness?: number;
	damping?: number;
	/** Perspective distance baked into the transform. */
	perspective?: number;
};

/**
 * Produces a gentle 3D tilt that follows the cursor and settles
 * back to neutral on `onMouseLeave`. Targets are spring-smoothed,
 * so input is natural and there is no jitter between frames.
 *
 * Perspective is embedded via `transformPerspective`, so the
 * effect works without requiring an ancestor to set `perspective`
 * and each element keeps its own 3D camera.
 */
export function useCardTilt({
	maxTilt = 15,
	stiffness = 200,
	damping = 20,
	perspective = 800,
}: TiltOptions = {}) {
	const prefersReducedMotion = useReducedMotion();

	const rotateX = useSpring(0, { stiffness, damping });
	const rotateY = useSpring(0, { stiffness, damping });

	const latestClientX = useRef(0);
	const latestClientY = useRef(0);
	const latestTarget = useRef<HTMLElement | null>(null);
	const pending = useRef(false);

	const onMouseMove = useCallback(
		(event: MouseEvent<HTMLElement>) => {
			if (prefersReducedMotion) return;
			latestClientX.current = event.clientX;
			latestClientY.current = event.clientY;
			latestTarget.current = event.currentTarget;

			if (pending.current) return;
			pending.current = true;

			requestAnimationFrame(() => {
				pending.current = false;
				const element = latestTarget.current;
				if (!element) return;
				const rect = element.getBoundingClientRect();
				if (rect.width === 0 || rect.height === 0) return;
				const proportionX = (latestClientX.current - rect.left) / rect.width;
				const proportionY = (latestClientY.current - rect.top) / rect.height;
				rotateX.set(maxTilt * (0.5 - proportionY));
				rotateY.set(maxTilt * (proportionX - 0.5));
			});
		},
		[prefersReducedMotion, rotateX, rotateY, maxTilt],
	);

	const onMouseLeave = useCallback(() => {
		rotateX.set(0);
		rotateY.set(0);
	}, [rotateX, rotateY]);

	const style: MotionStyle = {
		rotateX,
		rotateY,
		transformPerspective: perspective,
	};

	return { onMouseMove, onMouseLeave, style, rotateX, rotateY };
}
