import type { MintedHandoff } from "@bespoke/api/recipes/photo/handoff/handoff.service";
import { useEffect, useRef } from "react";

/** Leaving the page tombstones a live Link so a stray scan can't spend a Use. */
export function useCloseHandoffOnUnmount(
	link: MintedHandoff | null,
	close: (input: { nonce: string }) => void,
) {
	const linkRef = useRef<MintedHandoff | null>(null);
	useEffect(() => {
		linkRef.current = link;
	}, [link]);

	useEffect(() => {
		return () => {
			const live = linkRef.current;
			if (live) close({ nonce: live.nonce });
		};
	}, [close]);
}
