import type { Particle } from "./spawn";

const TURBULENCE = 6;
const CULL_MARGIN = 50;

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
	const visibleAge = p.age - p.fadeDelay;

	if (visibleAge < 0) {
		p.alpha = 0;
	} else if (visibleAge < p.fadeIn) {
		p.alpha = (visibleAge / p.fadeIn) * ALPHA_SCALE;
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
