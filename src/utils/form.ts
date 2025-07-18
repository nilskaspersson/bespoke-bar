export function isEmptyField(value: unknown): boolean {
	return value === undefined || value === "" || value === null;
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
