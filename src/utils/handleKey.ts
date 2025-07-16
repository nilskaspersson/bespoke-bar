import type { KeyboardEvent } from "react";

export function handleKey<T = Element>(
	args: [
		key: string,
		fn: ((event: KeyboardEvent<T>) => unknown) | undefined,
		onCondition?: (event: KeyboardEvent<T>) => boolean,
	][],
) {
	return (event: KeyboardEvent<T>) => {
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
