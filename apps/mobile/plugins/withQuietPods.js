const fs = require("node:fs");
const path = require("node:path");
const { withDangerousMod } = require("expo/config-plugins");

const ANCHOR = "prepare_react_native_project!";
const DIRECTIVE = "inhibit_all_warnings!";

/**
 * Every warning this build emits comes from a CocoaPods target we do not own
 * (Expo's own modules, Clerk's transitive Google pods). `inhibit_all_warnings!`
 * is scoped to pods, so warnings in `apps/mobile` and the BespokeBar target
 * still surface.
 */
module.exports = function withQuietPods(config) {
	return withDangerousMod(config, [
		"ios",
		(cfg) => {
			const podfile = path.join(cfg.modRequest.platformProjectRoot, "Podfile");
			const contents = fs.readFileSync(podfile, "utf8");

			if (contents.includes(DIRECTIVE)) {
				return cfg;
			}

			if (!contents.includes(ANCHOR)) {
				throw new Error(
					`withQuietPods: could not find "${ANCHOR}" in the generated Podfile.`,
				);
			}

			fs.writeFileSync(
				podfile,
				contents.replace(ANCHOR, `${ANCHOR}\n\n${DIRECTIVE}`),
			);

			return cfg;
		},
	]);
};
