import { createNextConfig } from "@bespoke/config/next";

export default createNextConfig({
	transpilePackages: ["@bespoke/ui", "@bespoke/domain", "@bespoke/schema"],
});
