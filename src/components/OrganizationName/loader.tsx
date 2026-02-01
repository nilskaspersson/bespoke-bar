"use client";

import dynamic from "next/dynamic";
import { OrganizationNameSkeleton } from ".";

/**
 * Exists to ensure the OrganizationName component is loaded in the client.
 * Otherwise, no parent layout can be cached.
 */
export const OrganizationNameLoader = dynamic(
	() => import(".").then((m) => m.OrganizationName),
	{
		loading: OrganizationNameSkeleton,
		ssr: false,
	},
);
