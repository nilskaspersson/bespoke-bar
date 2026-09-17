"use client";

import dynamic from "next/dynamic";
import { HandoffSkeleton } from "./skeleton";

export const HandoffContentLoader = dynamic(
	() => import("./content").then((m) => m.HandoffContent),
	{ ssr: false, loading: HandoffSkeleton },
);
