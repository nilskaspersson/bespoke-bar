import type { PropsWithChildren } from "react";
import { Chrome } from "@/components/Chrome";

export default function ChromeLayout({ children }: PropsWithChildren) {
	return <Chrome>{children}</Chrome>;
}
