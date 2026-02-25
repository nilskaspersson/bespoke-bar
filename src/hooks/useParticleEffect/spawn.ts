const AP_GRAVITY = -4;
const EP_GRAVITY = -15;
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
