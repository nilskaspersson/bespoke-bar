"use client";

import { useCallback, useState } from "react";

type ConfirmSubmitState = {
	isPending: boolean;
	resolveAction: (v?: unknown) => void;
	rejectAction: () => void;
};

/**
 * @returns Object with the following properties:
 * - `confirmAction`: Async function that can be awaited to behave like `window.confirm`
 * - `isPending`: `true` after `confirmAction` was invoked, until the user takes action
 * - `resolveAction`: Resolve `confirmAction()`
 * - `rejectAction`: Abort `confirmAction()`
 */
export function useConfirm() {
	const [state, setState] = useState<ConfirmSubmitState | null>(null);

	const confirmAction = useCallback(async (): Promise<boolean> => {
		const promise = new Promise((resolve, reject) => {
			setState({
				isPending: true,
				resolveAction: resolve,
				rejectAction: reject,
			});
		});

		try {
			await promise;
			return true;
		} catch (_e) {
			return false;
		} finally {
			setState?.(null);
		}
	}, []);

	return {
		...state,
		confirmAction,
	};
}
