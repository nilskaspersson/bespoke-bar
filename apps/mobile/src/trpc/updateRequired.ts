import { create } from "zustand";

type UpdateRequiredState = {
	updateRequired: boolean;
	dismissed: boolean;
	markRequired: () => void;
	clear: () => void;
	dismiss: () => void;
	resurface: () => void;
};

/**
 * The ADR-0009 min-version floor, client side. `updateRequired` latches on the
 * first `UPDATE_REQUIRED` response — the cached library keeps rendering, only
 * the refresh is refused; `dismissed` lets the user close the notice for this
 * session (a fresh launch resets the store). Actions are driven from both React
 * (the banner) and non-React callers (the query cache) via `.getState()`.
 */
export const updateRequiredStore = create<UpdateRequiredState>((set) => ({
	updateRequired: false,
	dismissed: false,
	markRequired: () => set({ updateRequired: true }),
	/** Any successful response proves we're back above the floor. */
	clear: () => set({ updateRequired: false, dismissed: false }),
	dismiss: () => set({ dismissed: true }),
	/**
	 * A user-initiated refresh is an explicit re-check: if we're still below the
	 * floor, bring a dismissed notice back so the pull isn't a silent no-op.
	 */
	resurface: () =>
		set((state) =>
			state.updateRequired && state.dismissed ? { dismissed: false } : {},
		),
}));

export const useUpdateRequired = updateRequiredStore;
