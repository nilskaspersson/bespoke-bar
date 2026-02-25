import { type RefObject, useEffect, useRef } from "react";
import {
	computeCardVelocity,
	createLoopState,
	frameSpawnScale,
	PARTICLE_COLORS,
	pollCardRect,
	SPRING_SETTLE_TIME,
	seedBackdropParticles,
	spawnFrameParticles,
} from "./loop";
import {
	computeFrameConstants,
	drawParticles,
	updateAndCompact,
} from "./simulation";
import type { Particle } from "./spawn";

const prefersReducedMotion =
	typeof window !== "undefined"
		? window.matchMedia("(prefers-reduced-motion: reduce)")
		: null;

/**
 * Drives a canvas-based particle system that reacts to the card's spring
 * animation. Returns a ref to attach to the `<canvas>` element.
 */
export function useParticleEffect(
	cardRef: RefObject<HTMLDivElement | null>,
	active: boolean,
): RefObject<HTMLCanvasElement | null> {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rafRef = useRef<number>(0);

	useEffect(() => {
		const card = cardRef.current;
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");

		if (!active || prefersReducedMotion?.matches || !canvas || !card || !ctx) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		window.addEventListener(
			"resize",
			() => {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
			},
			{ signal },
		);

		const particles: Particle[] = [];

		seedBackdropParticles(
			particles,
			canvas.width,
			canvas.height,
			PARTICLE_COLORS,
		);

		const state = createLoopState(performance.now());

		const loop = (now: number) => {
			if (signal.aborted) return;

			const elapsed = (now - state.startTime) / 1000;
			const springing = elapsed <= SPRING_SETTLE_TIME;

			const spawnScale = frameSpawnScale(elapsed, now, state.lastFrame);

			if (spawnScale === 0) {
				rafRef.current = requestAnimationFrame(loop);
				return;
			}

			const dt = Math.min((now - state.lastFrame) / 1000, 0.05);
			state.lastFrame = now;

			const rect = pollCardRect(card, state, springing);
			const vel = computeCardVelocity(rect, state, dt, springing);

			spawnFrameParticles(
				particles,
				rect,
				state,
				vel,
				ctx.canvas.width,
				ctx.canvas.height,
				elapsed,
				springing,
				spawnScale,
				PARTICLE_COLORS,
			);

			updateAndCompact(
				particles,
				computeFrameConstants(dt, ctx.canvas.width, ctx.canvas.height),
			);
			drawParticles(ctx, particles);

			rafRef.current = requestAnimationFrame(loop);
		};

		rafRef.current = requestAnimationFrame(loop);

		return () => {
			controller.abort();
			cancelAnimationFrame(rafRef.current);
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		};
	}, [active, cardRef]);

	return canvasRef;
}
