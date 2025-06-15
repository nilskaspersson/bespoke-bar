export function isEmptyField(value: unknown): boolean {
	return value === undefined || value === "" || value === null;
}

export function nullifyEmptyField<T>(value: T): T | null {
	return isEmptyField(value) ? null : value;
}
