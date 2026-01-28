type AnimationKeyframes = Keyframe[];

type AnimateOptions = {
	duration?: number;
	easing?: string;
	stagger?: number;
	delay?: number;
};

const DEFAULT_OPTIONS: Required<Pick<AnimateOptions, "duration" | "stagger">> =
	{
		duration: 150,
		stagger: (1000 / 60) * 3,
	};

export const keyframes = new Map<string, AnimationKeyframes>([
	[
		"pulse",
		[
			{ transform: "scale(1)", filter: "brightness(1)" },
			{ transform: "scale(1.25)", filter: "brightness(1.25)" },
			{ transform: "scale(1)", filter: "brightness(1)" },
		],
	],
	[
		"press",
		[
			// Deliberately omits initial state for immediate feedback
			{ transform: "scale(0.975)", filter: "brightness(0.925)" },
			{ transform: "scale(1)", filter: "brightness(1)" },
		],
	],
	[
		"shine",
		[
			{ filter: "brightness(1)" },
			{ filter: "brightness(1.25)" },
			{ filter: "brightness(1)" },
		],
	],
]);

/**
 * Animate a single element
 */
export function animate(
	element: Element | null | undefined,
	keyframes: AnimationKeyframes | undefined,
	options: AnimateOptions = {},
): Animation | undefined {
	if (!element || !keyframes) {
		return;
	}

	const { duration, easing, delay } = { ...DEFAULT_OPTIONS, ...options };

	return element.animate(keyframes, {
		duration,
		easing,
		delay,
	});
}

/**
 * Animate multiple elements with staggered delay
 */
export function animateStaggered(
	elements: HTMLCollection | Element[] | NodeListOf<Element> | null | undefined,
	keyframes: AnimationKeyframes | undefined,
	options: AnimateOptions = {},
): Animation[] {
	if (!elements || !keyframes) {
		return [];
	}

	const {
		duration,
		easing,
		stagger = 50,
		delay = 0,
	} = { ...DEFAULT_OPTIONS, ...options };

	return Array.from(elements).map((element, i) =>
		element.animate(keyframes, {
			duration,
			easing,
			delay: delay + i * stagger,
		}),
	);
}

/**
 * Animate children of an element with staggered delay
 */
export function animateChildren(
	parent: Element | null | undefined,
	keyframes: AnimationKeyframes | undefined,
	options: AnimateOptions = {},
): Animation[] {
	return animateStaggered(parent?.children, keyframes, options);
}
