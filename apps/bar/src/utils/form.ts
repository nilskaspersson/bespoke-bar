export function isEmptyField(value: unknown): boolean {
	return value === undefined || value === "" || value === null;
}

export function hasErrors(field: { errors?: unknown }): boolean {
	return Array.isArray(field.errors) && field.errors.length > 0;
}

export function nullifyEmptyField<T>(value: T): T | null {
	return isEmptyField(value) ? null : value;
}

export function focusFieldByName(
	form: HTMLFormElement | null,
	name: string,
): void {
	const node = form?.querySelector(`[name="${name}"]`);

	if (node instanceof HTMLInputElement) {
		node.focus();
	}
}
