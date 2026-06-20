"use client";

import dynamic from "next/dynamic";
import { AuthButtonsSkeleton } from ".";

export const AuthButtonsLoader = dynamic(
	() => import(".").then((m) => m.AuthButtons),
	{
		loading: AuthButtonsSkeleton,
		ssr: false,
	},
);
