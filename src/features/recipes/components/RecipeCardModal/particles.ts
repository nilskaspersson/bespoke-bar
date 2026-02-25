import { SPRING_DAMPING, SPRING_STIFFNESS } from "@/utils/animate";

const omega = Math.sqrt(SPRING_STIFFNESS);
const zeta = SPRING_DAMPING / (2 * Math.sqrt(SPRING_STIFFNESS));
const omegaD = omega * Math.sqrt(1 - zeta * zeta);

const AP_GRAVITY = -4;
const EP_GRAVITY = -15;
const TURBULENCE = 6;
const CULL_MARGIN = 50;
const TWO_PI = Math.PI * 2;

const SIZE_MIN = 0.5;
const SIZE_RANGE = 2;
const SIZE_BIAS = 1.5;

const EP_CURL_MIN = 0.8;
const EP_CURL_RANGE = 2 - EP_CURL_MIN;
const EP_SPREAD = 30;

export type Particle = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	color: string;
	alpha: number;
	lifetime: number;
	lifetimeInv: number;
	age: number;
	fadeIn: number;
	drag: number;
	dragEnd: number;
	gravity: number;
	curl: number;
};

export type CardRect = {
	left: number;
	top: number;
	width: number;
	height: number;
};

type SpawnEmittedOptions = {
	rect: CardRect;
	cardVx: number;
	cardVy: number;
	colors: string[];
	curlSign: number;
};

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
export function springVelocity(t: number): number {
	const index = t * SPRING_LUT_RATE;
	const i = Math.floor(index);
	if (i >= SPRING_LUT_SIZE - 1) return springLut[SPRING_LUT_SIZE - 1];
	const frac = index - i;
	return springLut[i] + (springLut[i + 1] - springLut[i]) * frac;
}

export function spawnBackdropParticle(
	width: number,
	height: number,
	colors: string[],
): Particle {
	const angle = Math.random() * TWO_PI;
	const speed = 2 + Math.random() * 6;
	const lifetime = 8000 + Math.random() * 12000;
	return {
		x: Math.random() * width,
		y: Math.random() * height,
		vx: Math.cos(angle) * speed,
		vy: Math.sin(angle) * speed,
		size: SIZE_MIN + Math.random() ** SIZE_BIAS * SIZE_RANGE,
		color: colors[Math.floor(Math.random() * colors.length)],
		alpha: 0,
		lifetime,
		lifetimeInv: 1 / lifetime,
		age: 0,
		fadeIn: 800,
		drag: 0.998,
		dragEnd: 0.998,
		gravity: AP_GRAVITY,
		curl: 0,
	};
}

const EDGE = { x: 0, y: 0 };

function randomEdgePoint(rect: CardRect): { x: number; y: number } {
	const { left, top, width, height } = rect;
	const perimeter = (width + height) * 2;
	let d = Math.random() * perimeter;

	if (d < width) {
		EDGE.x = left + d;
		EDGE.y = top;
	} else if (d - width < height) {
		d -= width;
		EDGE.x = left + width;
		EDGE.y = top + d;
	} else if (d - width - height < width) {
		d -= width + height;
		EDGE.x = left + width - d;
		EDGE.y = top + height;
	} else {
		d -= width * 2 + height;
		EDGE.x = left;
		EDGE.y = top + height - d;
	}
	return EDGE;
}

export function spawnEmittedParticle({
	rect,
	cardVx,
	cardVy,
	colors,
	curlSign,
}: SpawnEmittedOptions): Particle {
	const { x, y } = randomEdgePoint(rect);
	const scale = 0.5 + Math.random() * 0.3;

	const lifetime = 8000 + Math.random() * 8000;
	return {
		x,
		y,
		vx: cardVx * scale + (Math.random() - 0.5) * EP_SPREAD,
		vy: cardVy * scale + (Math.random() - 0.5) * EP_SPREAD,
		size: SIZE_MIN + Math.random() ** SIZE_BIAS * SIZE_RANGE,
		color: colors[Math.floor(Math.random() * colors.length)],
		alpha: 0,
		lifetime,
		lifetimeInv: 1 / lifetime,
		age: 0,
		fadeIn: 150,
		drag: 0.975,
		dragEnd: 0.998,
		gravity: EP_GRAVITY,
		curl: curlSign * (EP_CURL_MIN + Math.random() * EP_CURL_RANGE),
	};
}

export function spawnPassiveParticle(
	rect: CardRect,
	colors: string[],
): Particle {
	const { x, y } = randomEdgePoint(rect);
	const angle = Math.random() * TWO_PI;
	const speed = 8 + Math.random() * 14;
	const lifetime = 6000 + Math.random() * 8000;
	return {
		x,
		y,
		vx: Math.cos(angle) * speed,
		vy: Math.sin(angle) * speed,
		size: SIZE_MIN + Math.random() ** SIZE_BIAS * SIZE_RANGE,
		color: colors[Math.floor(Math.random() * colors.length)],
		alpha: 0,
		lifetime,
		lifetimeInv: 1 / lifetime,
		age: 0,
		fadeIn: 800,
		drag: 0.998,
		dragEnd: 0.998,
		gravity: AP_GRAVITY,
		curl: 0,
	};
}

export type FrameConstants = {
	dtMs: number;
	dt: number;
	turbScale: number;
	canvasW: number;
	canvasH: number;
	cullRight: number;
	cullBottom: number;
};

const FRAME: FrameConstants = {
	dtMs: 0,
	dt: 0,
	turbScale: 0,
	canvasW: 0,
	canvasH: 0,
	cullRight: 0,
	cullBottom: 0,
};

export function computeFrameConstants(
	dt: number,
	canvasW: number,
	canvasH: number,
): FrameConstants {
	FRAME.dtMs = dt * 1000;
	FRAME.dt = dt;
	FRAME.turbScale = TURBULENCE * dt;
	FRAME.canvasW = canvasW;
	FRAME.canvasH = canvasH;
	FRAME.cullRight = canvasW + CULL_MARGIN;
	FRAME.cullBottom = canvasH + CULL_MARGIN;
	return FRAME;
}

const ALPHA_SCALE = 0.5;

function updateParticle(p: Particle, f: FrameConstants): void {
	p.age += f.dtMs;
	if (p.age >= p.lifetime) return;

	if (
		p.x < -CULL_MARGIN ||
		p.x > f.cullRight ||
		p.y < -CULL_MARGIN ||
		p.y > f.cullBottom
	) {
		p.age = p.lifetime;
		return;
	}

	const progress = p.age * p.lifetimeInv;

	if (p.age < p.fadeIn) {
		p.alpha = (p.age / p.fadeIn) * ALPHA_SCALE;
	} else if (progress > 0.6) {
		p.alpha = (1 - (progress - 0.6) * 2.5) * ALPHA_SCALE;
	} else {
		p.alpha = ALPHA_SCALE;
	}

	const r = Math.random();
	const hash = r * 2654435.761;

	p.vy += p.gravity * f.dt;
	p.vx += (r - 0.5) * f.turbScale;
	p.vy += (hash - Math.floor(hash) - 0.5) * f.turbScale;

	if (p.curl !== 0) {
		const c = p.curl * f.dt;
		const vx = p.vx - p.vy * c;
		p.vy = p.vy + p.vx * c;
		p.vx = vx;
	}

	p.x += p.vx * f.dt;
	p.y += p.vy * f.dt;

	if (p.drag !== p.dragEnd) {
		const t = Math.min(progress * 3, 1);
		const effectiveDrag = p.drag + (p.dragEnd - p.drag) * t;
		p.vx *= effectiveDrag;
		p.vy *= effectiveDrag;
		if (t >= 1) {
			p.drag = p.dragEnd;
			p.curl = 0;
		}
	} else {
		p.vx *= p.drag;
		p.vy *= p.drag;
	}
}

const colorBuckets: Map<string, Particle[]> = new Map();

export function drawParticles(
	ctx: CanvasRenderingContext2D,
	particles: Particle[],
) {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	for (const bucket of colorBuckets.values()) bucket.length = 0;
	for (const p of particles) {
		if (p.alpha <= 0) continue;
		let bucket = colorBuckets.get(p.color);
		if (!bucket) {
			bucket = [];
			colorBuckets.set(p.color, bucket);
		}
		bucket.push(p);
	}

	for (const [color, bucket] of colorBuckets) {
		if (bucket.length === 0) continue;
		ctx.fillStyle = color;
		for (const p of bucket) {
			ctx.globalAlpha = p.alpha;
			ctx.fillRect(p.x, p.y, p.size, p.size);
		}
	}

	ctx.globalAlpha = 1;
}

export function updateAndCompact(
	particles: Particle[],
	f: FrameConstants,
): void {
	let i = 0;
	while (i < particles.length) {
		const p = particles[i];
		updateParticle(p, f);
		if (p.age >= p.lifetime) {
			particles[i] = particles[particles.length - 1];
			particles.pop();
		} else {
			i++;
		}
	}
}
