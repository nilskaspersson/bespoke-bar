const DRAFT_KEY = "ingredient-create-draft";

type DraftField =
	| "name"
	| "description"
	| "category"
	| "abv"
	| "brand"
	| "unitCost"
	| "measurementType";

export type IngredientDraft = Partial<Record<DraftField, string>>;

export function readIngredientDraft(): IngredientDraft {
	if (typeof window === "undefined") {
		return {};
	}

	try {
		const raw = window.sessionStorage.getItem(DRAFT_KEY);
		return raw ? (JSON.parse(raw) as IngredientDraft) : {};
	} catch {
		return {};
	}
}

export function saveIngredientDraft(form: HTMLFormElement): void {
	try {
		const entries = Object.fromEntries(new FormData(form));
		window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(entries));
	} catch {
		// sessionStorage can be unavailable (private mode, quota) — drafts are best-effort.
	}
}

export function clearIngredientDraft(): void {
	try {
		window.sessionStorage.removeItem(DRAFT_KEY);
	} catch {
		// Best-effort; ignore storage failures.
	}
}
