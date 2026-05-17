"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { OrganisationSwitcherSkeleton } from ".";

const Inner = dynamic(() => import(".").then((m) => m.OrganisationSwitcher), {
	loading: () => <OrganisationSwitcherSkeleton />,
	ssr: false,
});

export function OrganisationSwitcherLoader({
	className,
}: {
	className?: string;
}) {
	return (
		<Suspense fallback={<OrganisationSwitcherSkeleton className={className} />}>
			<Inner className={className} />
		</Suspense>
	);
}
