import type { KeyboardEvent } from "react";

export function handleKey<T = unknown>(
	args: [
		key: string,
		fn: ((event: KeyboardEvent) => T) | undefined,
		onCondition?: (event: KeyboardEvent) => boolean,
	][],
) {
	return (event: KeyboardEvent) => {
		args.forEach(([key, fn, onCondition]) => {
			if (
				key === event.key &&
				(typeof onCondition === "undefined" || onCondition?.(event))
			) {
				event.preventDefault();
				fn?.(event);
			}
		});
	};
}
