export function hasErrors(field: { errors?: unknown }): boolean {
	return Array.isArray(field.errors) && field.errors.length > 0;
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
