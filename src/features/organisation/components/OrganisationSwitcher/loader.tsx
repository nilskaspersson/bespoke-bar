"use client";

import dynamic from "next/dynamic";
import { OrganisationSwitcherSkeleton } from ".";

export const OrganisationSwitcherLoader = dynamic(
	() => import(".").then((m) => m.OrganisationSwitcher),
	{
		loading: () => <OrganisationSwitcherSkeleton />,
		ssr: false,
	},
);
