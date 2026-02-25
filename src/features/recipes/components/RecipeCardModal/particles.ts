/**
 * Mirrors Motion's spring config: { stiffness: 400, damping: 35, mass: 1 }
 */
const STIFFNESS = 400;
const DAMPING = 35;
const MASS = 1;

const omega = Math.sqrt(STIFFNESS / MASS);
const zeta = DAMPING / (2 * Math.sqrt(STIFFNESS * MASS));
const omegaD = omega * Math.sqrt(1 - zeta * zeta);

const AP_GRAVITY = -4;
const EP_GRAVITY = -15;
const TURBULENCE = 6;
const CULL_MARGIN = 50;
const TWO_PI = Math.PI * 2;

const SIZE_MIN = 0.5;
const SIZE_RANGE = 2;
const SIZE_BIAS = 1.5;

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
	drag: number;
	dragEnd: number;
	gravity: number;
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
};

/**
 * Pre-computed spring velocity lookup table. The spring settles within
 * SPRING_LUT_DURATION seconds; values are sampled at 120Hz for sub-frame
 * interpolation.
 */
const SPRING_LUT_DURATION = 0.5;
const SPRING_LUT_RATE = 120;
const SPRING_LUT_SIZE = Math.ceil(SPRING_LUT_DURATION * SPRING_LUT_RATE) + 1;
const springLut = new Float32Array(SPRING_LUT_SIZE);

for (let i = 0; i < SPRING_LUT_SIZE; i++) {
	const t = i / SPRING_LUT_RATE;
	const decay = Math.exp(-zeta * omega * t);
	const cos = Math.cos(omegaD * t);
	const sin = Math.sin(omegaD * t);
	springLut[i] = Math.abs(decay * (zeta * omega * cos + omegaD * sin));
}

/** Looks up the pre-computed spring velocity at time `t` (seconds). */
export function springVelocity(t: number): number {
	const index = t * SPRING_LUT_RATE;
	const i = Math.floor(index);
	if (i >= SPRING_LUT_SIZE - 1) return springLut[SPRING_LUT_SIZE - 1];
	const frac = index - i;
	return springLut[i] + (springLut[i + 1] - springLut[i]) * frac;
}

/** Spawns a particle at a random viewport position with gentle drift. */
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
		drag: 0.998,
		dragEnd: 0.998,
		gravity: AP_GRAVITY,
	};
}

const _edge = { x: 0, y: 0 };

/** Returns a reused singleton — read immediately before the next call. */
function randomEdgePoint(rect: CardRect): { x: number; y: number } {
	const { left, top, width, height } = rect;
	const perimeter = (width + height) * 2;
	let d = Math.random() * perimeter;

	if (d < width) {
		_edge.x = left + d;
		_edge.y = top;
	} else if (d - width < height) {
		d -= width;
		_edge.x = left + width;
		_edge.y = top + d;
	} else if (d - width - height < width) {
		d -= width + height;
		_edge.x = left + width - d;
		_edge.y = top + height;
	} else {
		d -= width * 2 + height;
		_edge.x = left;
		_edge.y = top + height - d;
	}
	return _edge;
}

/**
 * Spawns a particle from a card edge with velocity inherited from the card's
 * movement. Heavy initial drag brakes the card velocity, then lerps to
 * backdrop-level drag so the particle settles into the ambient flow.
 */
export function spawnEmittedParticle({
	rect,
	cardVx,
	cardVy,
	colors,
}: SpawnEmittedOptions): Particle {
	const { x, y } = randomEdgePoint(rect);
	const scale = 0.3 + Math.random() * 0.2;
	const spread = 30;

	const lifetime = 5000 + Math.random() * 5000;
	return {
		x,
		y,
		vx: cardVx * scale + (Math.random() - 0.5) * spread,
		vy: cardVy * scale + (Math.random() - 0.5) * spread,
		size: SIZE_MIN + Math.random() ** SIZE_BIAS * SIZE_RANGE,
		color: colors[Math.floor(Math.random() * colors.length)],
		alpha: 0,
		lifetime,
		lifetimeInv: 1 / lifetime,
		age: 0,
		drag: 0.975,
		dragEnd: 0.995,
		gravity: EP_GRAVITY,
	};
}

/** Spawns a particle from a card edge with backdrop-like behavior from birth. */
export function spawnPassiveParticle(
	rect: CardRect,
	colors: string[],
): Particle {
	const { x, y } = randomEdgePoint(rect);
	const angle = Math.random() * TWO_PI;
	const speed = 2 + Math.random() * 6;
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
		drag: 0.998,
		dragEnd: 0.998,
		gravity: AP_GRAVITY,
	};
}

export function burstEmissionCount(springVel: number): number {
	return Math.round(springVel * 4 + Math.random());
}

/** Per-frame constants, pre-computed once and reused for all particles. */
export type FrameConstants = {
	dtMs: number;
	dt: number;
	turbScale: number;
	canvasW: number;
	canvasH: number;
	cullRight: number;
	cullBottom: number;
};

const _frame: FrameConstants = {
	dtMs: 0,
	dt: 0,
	turbScale: 0,
	canvasW: 0,
	canvasH: 0,
	cullRight: 0,
	cullBottom: 0,
};

/** Mutates and returns a singleton — never allocates after first call. */
export function computeFrameConstants(
	dt: number,
	canvasW: number,
	canvasH: number,
): FrameConstants {
	_frame.dtMs = dt * 1000;
	_frame.dt = dt;
	_frame.turbScale = TURBULENCE * dt;
	_frame.canvasW = canvasW;
	_frame.canvasH = canvasH;
	_frame.cullRight = canvasW + CULL_MARGIN;
	_frame.cullBottom = canvasH + CULL_MARGIN;
	return _frame;
}

const ALPHA_SCALE = 0.55;

/**
 * Advances a particle by one frame. Alpha is pre-multiplied for draw.
 * Kills particles that have exceeded their lifetime or drifted off-screen.
 */
export function updateParticle(p: Particle, f: FrameConstants): void {
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

	// Fade in over first 10%, hold, fade out over final 40% (pre-multiplied)
	if (progress < 0.1) {
		p.alpha = progress * 10 * ALPHA_SCALE;
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

	p.x += p.vx * f.dt;
	p.y += p.vy * f.dt;

	if (p.drag !== p.dragEnd) {
		const t = Math.min(progress * 3, 1);
		const effectiveDrag = p.drag + (p.dragEnd - p.drag) * t;
		p.vx *= effectiveDrag;
		p.vy *= effectiveDrag;
		if (t >= 1) p.drag = p.dragEnd;
	} else {
		p.vx *= p.drag;
		p.vy *= p.drag;
	}
}

// Pre-allocated buckets to avoid per-frame Map/array allocation
const colorBuckets: Map<string, Particle[]> = new Map();

/**
 * Clears the canvas and redraws all visible particles, batched by color.
 * Uses fillRect instead of arc — visually identical at this particle size
 * and significantly cheaper (no path construction or arc tessellation).
 */
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

/** Updates all particles and removes dead ones in a single pass. */
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
