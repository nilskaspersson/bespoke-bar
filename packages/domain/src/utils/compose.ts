export function compose<T>(fn: (a: T) => T, ...fns: Array<(a: T) => T>) {
	return fns.reduce((prev, next) => (v) => prev(next(v)), fn);
}

export function pipe<T>(fn: (a: T) => T, ...fns: Array<(a: T) => T>) {
	return fns.reduce((prev, next) => (v) => next(prev(v)), fn);
}
