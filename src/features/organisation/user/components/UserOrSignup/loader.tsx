"use client";

import dynamic from "next/dynamic";
import { UserOrSignupSkeleton } from ".";

export const UserOrSignupLoader = dynamic(
	() => import(".").then((m) => m.UserOrSignup),
	{
		loading: UserOrSignupSkeleton,
		ssr: false,
	},
);
