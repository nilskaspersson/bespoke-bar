import { node } from "@bespoke/config/vitest";
import { defineConfig } from "vitest/config";

export default defineConfig({
	...node,
	test: {
		...node.test,
		/**
		 * Off for accuracy, not for quiet: the getter-access tracking behind this
		 * warning costs 20-27% here (measured 405k vs 520k hz on the tokenizeLine
		 * bench), and it compresses the ratio the benchmarks exist to show.
		 *
		 * The warning is also unactionable. Four of the five hot exports are
		 * imported inside `tokenizeLine.ts`, not the bench file, so Vitest's
		 * local-variable workaround would mean editing production source; and
		 * native ESM is out because this package uses extensionless relative
		 * imports throughout.
		 *
		 * Residual getter overhead still applies equally to both sides of each
		 * comparison, so read these as ratios — the absolute hz is understated.
		 */
		benchmark: { suppressExportGetterWarnings: true },
	},
});
