import { useEffect, useRef, useState } from "react";
import { useOnNavigation } from "@/hooks/useOnNavigation";

export function useDialog() {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const dialog = dialogRef.current;

		if (!dialog) return;

		const controller = new AbortController();

		dialog.addEventListener(
			"toggle",
			(e) => {
				setIsOpen((e as ToggleEvent).newState === "open");
			},
			{ signal: controller.signal },
		);

		return () => controller.abort();
	}, []);

	useOnNavigation(
		isOpen
			? () => {
					if (dialogRef.current?.open) {
						dialogRef.current.close("dismiss");
					}
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
	};
}
