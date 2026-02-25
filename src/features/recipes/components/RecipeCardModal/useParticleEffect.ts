import { type RefObject, useEffect, useRef } from "react";
import {
	burstEmissionCount,
	type CardRect,
	computeFrameConstants,
	drawParticles,
	type Particle,
	spawnBackdropParticle,
	spawnEmittedParticle,
	spawnPassiveParticle,
	springVelocity,
	updateAndCompact,
} from "./particles";

const SPRING_SETTLE_TIME = 0.5;
const BACKDROP_DENSITY = 0.00008;
const BACKDROP_TRICKLE_DENSITY = 0.0000002;
const MIN_CARD_SPEED_SQ = 100 * 100;
const PASSIVE_EMIT_CHANCE = 0.58;
const AMBIENT_FRAME_INTERVAL = 1000 / 30;
const THROTTLE_GRACE = 2;

const prefersReducedMotion =
	typeof window !== "undefined"
		? window.matchMedia("(prefers-reduced-motion: reduce)")
		: null;

const PARTICLE_COLORS = ["#f5e6da", "#f2d5b8", "#e8c4a0"];

/**
 * Drives a canvas-based particle system that reacts to the card's spring
 * animation. Returns a ref to attach to the `<canvas>` element.
 *
 * Respects `prefers-reduced-motion` — no work is done when the user
 * has requested reduced motion.
 */
export function useParticleEffect(
	cardRef: RefObject<HTMLDivElement | null>,
	active: boolean,
): RefObject<HTMLCanvasElement | null> {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const particlesRef = useRef<Particle[]>([]);
	const rafRef = useRef<number>(0);

	useEffect(() => {
		if (!active) return;
		if (prefersReducedMotion?.matches) return;

		const canvas = canvasRef.current;
		const card = cardRef.current;
		if (!canvas || !card) return;

		const maybeCtx = canvas.getContext("2d");
		if (!maybeCtx) return;
		const ctx = maybeCtx;

		const w = window.innerWidth;
		const h = window.innerHeight;
		canvas.width = w;
		canvas.height = h;

		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		window.addEventListener("resize", resize);

		const colors = PARTICLE_COLORS;
		const particles = particlesRef.current;
		particles.length = 0;

		const area = w * h;
		const initialCount = Math.round(area * BACKDROP_DENSITY);
		const trickleChance = area * BACKDROP_TRICKLE_DENSITY;

		// Pre-age seeded particles so they appear mid-life
		for (let i = 0; i < initialCount; i++) {
			const p = spawnBackdropParticle(w, h, colors);
			p.age = Math.random() * p.lifetime * 0.5;
			p.alpha = 0.8;
			particles.push(p);
		}

		let curlSign = 0;
		const startTime = performance.now();
		let lastFrame = startTime;
		const prevRect: CardRect = { left: 0, top: 0, width: 0, height: 0 };
		let hasPrevRect = false;
		let settledRect: CardRect | null = null;

		function loop(now: number) {
			const elapsed = (now - startTime) / 1000;
			const springing = elapsed <= SPRING_SETTLE_TIME;

			// Throttle to ~30fps once EPs have had time to brake
			const canThrottle = elapsed > SPRING_SETTLE_TIME + THROTTLE_GRACE;
			if (canThrottle && now - lastFrame < AMBIENT_FRAME_INTERVAL) {
				rafRef.current = requestAnimationFrame(loop);
				return;
			}

			const dt = Math.min((now - lastFrame) / 1000, 0.05);
			lastFrame = now;

			// Poll card rect during spring, cache after settling
			let rect: CardRect;
			if (springing) {
				const cardEl = cardRef.current;
				if (!cardEl) return;
				const domRect = cardEl.getBoundingClientRect();
				rect = {
					left: domRect.left,
					top: domRect.top,
					width: domRect.width,
					height: domRect.height,
				};
			} else {
				if (!settledRect) {
					const cardEl = cardRef.current;
					if (!cardEl) return;
					const domRect = cardEl.getBoundingClientRect();
					settledRect = {
						left: domRect.left,
						top: domRect.top,
						width: domRect.width,
						height: domRect.height,
					};
				}
				rect = settledRect;
			}

			// Card velocity is only meaningful during the spring phase
			let cardVx = 0;
			let cardVy = 0;
			let cardSpeedSq = 0;
			if (springing) {
				if (hasPrevRect && dt > 0) {
					const cx = rect.left + rect.width / 2;
					const cy = rect.top + rect.height / 2;
					const prevCx = prevRect.left + prevRect.width / 2;
					const prevCy = prevRect.top + prevRect.height / 2;
					cardVx = (cx - prevCx) / dt;
					cardVy = (cy - prevCy) / dt;
					cardSpeedSq = cardVx * cardVx + cardVy * cardVy;
				}
				prevRect.left = rect.left;
				prevRect.top = rect.top;
				prevRect.width = rect.width;
				prevRect.height = rect.height;
				hasPrevRect = true;
			}

			// Double spawn chances when throttled to keep density constant
			const spawnScale = canThrottle ? 2 : 1;

			if (Math.random() < trickleChance * spawnScale) {
				particles.push(
					spawnBackdropParticle(ctx.canvas.width, ctx.canvas.height, colors),
				);
			}

			if (springing && cardSpeedSq > MIN_CARD_SPEED_SQ) {
				if (curlSign === 0) {
					const cardCx = rect.left + rect.width / 2;
					curlSign = cardCx < ctx.canvas.width / 2 ? 1 : -1;
				}
				const vel = springVelocity(elapsed);
				const burstCount = burstEmissionCount(vel);
				for (let i = 0; i < burstCount; i++) {
					particles.push(
						spawnEmittedParticle({ rect, cardVx, cardVy, colors, curlSign }),
					);
				}
			}

			if (Math.random() < PASSIVE_EMIT_CHANCE * spawnScale) {
				particles.push(spawnPassiveParticle(rect, colors));
			}

			const frame = computeFrameConstants(
				dt,
				ctx.canvas.width,
				ctx.canvas.height,
			);
			updateAndCompact(particles, frame);

			drawParticles(ctx, particles);
			rafRef.current = requestAnimationFrame(loop);
		}

		rafRef.current = requestAnimationFrame(loop);

		return () => {
			cancelAnimationFrame(rafRef.current);
			window.removeEventListener("resize", resize);
			particles.length = 0;
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		};
	}, [active, cardRef]);

	return canvasRef;
}
