export function handleKey(
	args: [
		key: KeyboardEvent["key"],
		fn: ((event: KeyboardEvent) => unknown) | undefined,
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
