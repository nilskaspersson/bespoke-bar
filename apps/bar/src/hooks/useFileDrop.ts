"use client";

import {
	type DragEvent,
	type DragEventHandler,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

/**
 * How long after the last window `dragover` to conclude the drag is gone. Must
 * comfortably exceed the browser's idle `dragover` re-fire interval (~350ms) so
 * holding a file still over the window doesn't prematurely clear the state.
 */
const DRAG_END_GRACE_MS = 500;

function dragCarriesFiles(event: DragEvent | globalThis.DragEvent) {
	return event.dataTransfer?.types.includes("Files") ?? false;
}

function allowFileDrop(event: DragEvent) {
	if (!dragCarriesFiles(event)) {
		return;
	}
	event.preventDefault();
	event.dataTransfer.dropEffect = "copy";
}

/**
 * Native HTML5 file drop for a region, with window-wide drag awareness.
 *
 * Attach `dropZoneRef` to the drop target and spread `dropHandlers` on it.
 * `isFileDragging` is true while a file is dragged anywhere over the window;
 * `isDraggingOver` is true while it's specifically over the target.
 *
 * The window's `dragover` is the single source of truth: it keeps firing while
 * a file is over the page and stops the instant the drag ends. Each event is
 * read fresh — `isFileDragging` from its presence (a trailing timer clears it
 * on the silence, so it can't get stuck), `isDraggingOver` from whether the
 * zone contains the event target. No enter/leave tally to drift. `dragover`
 * and `drop` are default-prevented so the browser won't navigate to a file
 * dropped off-target.
 */
export function useFileDrop<T extends HTMLElement = HTMLElement>({
	onFiles,
}: {
	onFiles: (files: FileList) => void;
}) {
	const dropZoneRef = useRef<T>(null);
	const [isDraggingOver, setIsDraggingOver] = useState(false);
	const [isFileDragging, setIsFileDragging] = useState(false);

	/**
	 * File handling lives on the element, not the window `drop` listener below, so
	 * `onFiles` is read fresh — a window listener bound once with `[]` deps would
	 * capture it stale.
	 */
	const onDrop = useCallback<DragEventHandler>(
		(event) => {
			if (!dragCarriesFiles(event)) {
				return;
			}
			event.preventDefault();
			if (event.dataTransfer.files.length > 0) {
				onFiles(event.dataTransfer.files);
			}
		},
		[onFiles],
	);

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;
		let hideTimer: ReturnType<typeof setTimeout> | undefined;

		function endDrag() {
			setIsFileDragging(false);
			setIsDraggingOver(false);
		}

		function onWindowDragOver(event: globalThis.DragEvent) {
			if (!dragCarriesFiles(event)) {
				return;
			}
			// Makes the whole page a drop target, so a file dropped off-zone fires
			// `drop` (where we swallow it) instead of the browser navigating to it.
			event.preventDefault();

			const overZone =
				event.target instanceof Node &&
				(dropZoneRef.current?.contains(event.target) ?? false);

			setIsFileDragging(true);
			setIsDraggingOver(overZone);
			clearTimeout(hideTimer);
			hideTimer = setTimeout(endDrag, DRAG_END_GRACE_MS);
		}

		function onWindowDrop(event: globalThis.DragEvent) {
			if (dragCarriesFiles(event)) {
				event.preventDefault();
			}
			clearTimeout(hideTimer);
			endDrag();
		}

		window.addEventListener("dragover", onWindowDragOver, { signal });
		window.addEventListener("drop", onWindowDrop, { signal });

		return () => {
			controller.abort();
			clearTimeout(hideTimer);
		};
	}, []);

	return {
		dropZoneRef,
		isDraggingOver,
		isFileDragging,
		dropHandlers: { onDragOver: allowFileDrop, onDrop },
	};
}
