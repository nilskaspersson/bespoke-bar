import { vercelAdapter } from "@flags-sdk/vercel";
import { flag } from "flags/next";

export const rateLimitEnabledFlag = flag<boolean>({
	key: "rate-limit-enabled",
	description: "Enable Upstash rate limiting in proxy",
	defaultValue: false,
	adapter: vercelAdapter(),
});
