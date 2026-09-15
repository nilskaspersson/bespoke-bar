"use client";

import dynamic from "next/dynamic";

export const HandoffDialogLoader = dynamic(
	() => import(".").then((m) => m.HandoffDialog),
	{ ssr: false },
);
