import { useCallback, useEffect, useRef, useState } from "react";
import { useOnNavigation } from "@/hooks/useOnNavigation";

export function useDialog(options?: { onNavigationClose?: () => void }) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const dialog = dialogRef.current;

		if (!dialog) return;

		const controller = new AbortController();

		dialog.addEventListener(
			"toggle",
			(event) => {
				const open = event.newState === "open";
				setIsOpen(open);

				/**
				 * Only mount on open — never unmount here. Unmounting is deferred to `unmount()`
				 * so consumers can, f.e., finish exit animations before children are removed
				 * from the DOM, or preserve state.
				 */
				if (open) {
					setMounted(true);
				}
			},
			{ signal: controller.signal },
		);

		return () => controller.abort();
	}, []);

	const unmount = useCallback(() => setMounted(false), []);

	useOnNavigation(
		isOpen
			? () => {
					if (dialogRef.current?.open) {
						dialogRef.current.close("dismiss");
					}

					options?.onNavigationClose?.();
				}
			: undefined,
	);

	useEffect(() => {
		if (!isOpen) return;

		const dialog = dialogRef.current;

		return () => {
			if (dialog?.open) {
				dialog.close("dismiss");
			}
		};
	}, [isOpen]);

	return {
		dialogRef,
		isOpen,
		mounted,
		unmount,
	};
}
