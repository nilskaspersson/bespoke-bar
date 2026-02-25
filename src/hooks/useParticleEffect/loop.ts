import { SPRING_DAMPING, SPRING_STIFFNESS } from "@/utils/animate";
import {
	type CardRect,
	type Particle,
	spawnBackdropParticle,
	spawnEmittedParticle,
	spawnPassiveParticle,
} from "./spawn";

const omega = Math.sqrt(SPRING_STIFFNESS);
const zeta = SPRING_DAMPING / (2 * Math.sqrt(SPRING_STIFFNESS));
const omegaD = omega * Math.sqrt(1 - zeta * zeta);

export const SPRING_SETTLE_TIME = 0.5;

const SPRING_LUT_RATE = 120;
const SPRING_LUT_SIZE = Math.ceil(SPRING_SETTLE_TIME * SPRING_LUT_RATE) + 1;
const springLut = new Float32Array(SPRING_LUT_SIZE);

for (let i = 0; i < SPRING_LUT_SIZE; i++) {
	const t = i / SPRING_LUT_RATE;
	const decay = Math.exp(-zeta * omega * t);
	const cos = Math.cos(omegaD * t);
	const sin = Math.sin(omegaD * t);
	springLut[i] = Math.abs(decay * (zeta * omega * cos + omegaD * sin));
}

/** Pre-computed spring velocity lookup with linear interpolation. */
function springVelocity(t: number): number {
	const index = t * SPRING_LUT_RATE;
	const i = Math.floor(index);
	if (i >= SPRING_LUT_SIZE - 1) return springLut[SPRING_LUT_SIZE - 1];
	const frac = index - i;
	return springLut[i] + (springLut[i + 1] - springLut[i]) * frac;
}

const BACKDROP_DENSITY = 0.000096;
const BACKDROP_TRICKLE_DENSITY = 0.00000024;
const MIN_CARD_SPEED_SQ = 100 * 100;
const PASSIVE_EMIT_CHANCE = 0.58;
const AMBIENT_FRAME_INTERVAL = 1000 / 30;
const THROTTLE_GRACE = 2;

export const PARTICLE_COLORS = ["#f5e6da", "#f2d5b8", "#e8c4a0"];

export type LoopState = {
	curlSign: number;
	startTime: number;
	lastFrame: number;
	prevRect: CardRect;
	hasPrevRect: boolean;
	settledRect: CardRect | null;
};

export function createLoopState(now: number): LoopState {
	return {
		curlSign: 0,
		startTime: now,
		lastFrame: now,
		prevRect: { left: 0, top: 0, width: 0, height: 0 },
		hasPrevRect: false,
		settledRect: null,
	};
}

export type CardVelocity = { vx: number; vy: number; speedSq: number };

function toCardRect(el: HTMLElement): CardRect {
	const { left, top, width, height } = el.getBoundingClientRect();
	return { left, top, width, height };
}

export function seedBackdropParticles(
	particles: Particle[],
	w: number,
	h: number,
	colors: string[],
): void {
	const count = Math.round(w * h * BACKDROP_DENSITY);
	for (let i = 0; i < count; i++) {
		const p = spawnBackdropParticle(w, h, colors);
		p.age = Math.random() * p.lifetime * 0.5;
		p.alpha = 0.8;
		particles.push(p);
	}
}

/** Returns 0 (skip frame), 1 (normal), or 2 (doubled — compensates for 30fps throttle). */
export function frameSpawnScale(
	elapsed: number,
	now: number,
	lastFrame: number,
): number {
	const canThrottle = elapsed > SPRING_SETTLE_TIME + THROTTLE_GRACE;
	if (canThrottle && now - lastFrame < AMBIENT_FRAME_INTERVAL) return 0;
	return canThrottle ? 2 : 1;
}

export function pollCardRect(
	card: HTMLElement,
	state: LoopState,
	springing: boolean,
): CardRect {
	if (springing) return toCardRect(card);
	if (!state.settledRect) state.settledRect = toCardRect(card);
	return state.settledRect;
}

const VELOCITY: CardVelocity = { vx: 0, vy: 0, speedSq: 0 };

export function computeCardVelocity(
	rect: CardRect,
	state: LoopState,
	dt: number,
	springing: boolean,
): CardVelocity {
	VELOCITY.vx = 0;
	VELOCITY.vy = 0;
	VELOCITY.speedSq = 0;

	if (springing) {
		if (state.hasPrevRect && dt > 0) {
			const cx = rect.left + rect.width / 2;
			const cy = rect.top + rect.height / 2;
			const prevCx = state.prevRect.left + state.prevRect.width / 2;
			const prevCy = state.prevRect.top + state.prevRect.height / 2;
			VELOCITY.vx = (cx - prevCx) / dt;
			VELOCITY.vy = (cy - prevCy) / dt;
			VELOCITY.speedSq = VELOCITY.vx * VELOCITY.vx + VELOCITY.vy * VELOCITY.vy;
		}
		state.prevRect.left = rect.left;
		state.prevRect.top = rect.top;
		state.prevRect.width = rect.width;
		state.prevRect.height = rect.height;
		state.hasPrevRect = true;
	}

	return VELOCITY;
}

export function spawnFrameParticles(
	particles: Particle[],
	rect: CardRect,
	state: LoopState,
	vel: CardVelocity,
	canvasW: number,
	canvasH: number,
	elapsed: number,
	springing: boolean,
	spawnScale: number,
	colors: string[],
): void {
	const trickleChance = canvasW * canvasH * BACKDROP_TRICKLE_DENSITY;

	if (Math.random() < trickleChance * spawnScale) {
		particles.push(spawnBackdropParticle(canvasW, canvasH, colors));
	}

	if (springing && vel.speedSq > MIN_CARD_SPEED_SQ) {
		if (state.curlSign === 0) {
			const cardCx = rect.left + rect.width / 2;
			state.curlSign = cardCx < canvasW / 2 ? 1 : -1;
		}
		const burstCount = Math.round(
			springVelocity(elapsed) * 3.2 + Math.random(),
		);
		for (let i = 0; i < burstCount; i++) {
			particles.push(
				spawnEmittedParticle({
					rect,
					cardVx: vel.vx,
					cardVy: vel.vy,
					colors,
					curlSign: state.curlSign,
				}),
			);
		}
	}

	if (Math.random() < PASSIVE_EMIT_CHANCE * spawnScale) {
		particles.push(spawnPassiveParticle(rect, colors));
	}
}
