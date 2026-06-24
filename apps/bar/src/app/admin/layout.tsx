import type { ReactNode } from "react";
import { Providers } from "@/components/Providers";

export default function AdminLayout({ children }: { children: ReactNode }) {
	return <Providers>{children}</Providers>;
}
