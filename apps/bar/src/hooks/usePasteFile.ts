"use client";

import { useEffect } from "react";

/**
 * A paste aimed at an editable element (an input, textarea, or contenteditable
 * such as the draft-recipe editor) must keep its normal behaviour, so it's
 * skipped. `:read-write` is the browser's own definition of "user-editable".
 */
function targetIsEditable(target: EventTarget | null) {
	return target instanceof Element && target.closest(":read-write") !== null;
}

/**
 * Window-wide image paste.
 */
export function usePasteFile({
	onFiles,
}: {
	onFiles: (files: FileList) => void;
}) {
	useEffect(() => {
		const controller = new AbortController();

		function onPaste(event: ClipboardEvent) {
			if (targetIsEditable(event.target)) {
				return;
			}

			const files = event.clipboardData?.files;
			if (!files || files.length === 0) {
				return;
			}

			event.preventDefault();
			onFiles(files);
		}

		window.addEventListener("paste", onPaste, { signal: controller.signal });

		return () => controller.abort();
	}, [onFiles]);
}
