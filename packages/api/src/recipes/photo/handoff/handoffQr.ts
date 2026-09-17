import { encode } from "uqr";

export type HandoffQr = {
	/** Modules per side, quiet zone included. */
	size: number;
	/** SVG path in module units, one rect per run of dark modules. */
	path: string;
};

/**
 * Medium error correction is plenty for a code scanned off a screen; the
 * 4-module border matters more.
 */
export function renderHandoffQr(url: string): HandoffQr {
	const { data } = encode(url, { ecc: "M", border: 4 });
	const size = data.length;
	let path = "";

	data.forEach((row, y) => {
		let x = 0;
		while (x < size) {
			if (!row[x]) {
				x += 1;
				continue;
			}
			let run = 1;
			while (x + run < size && row[x + run]) {
				run += 1;
			}
			path += `M${x} ${y}h${run}v1h-${run}z`;
			x += run;
		}
	});

	return { size, path };
}
