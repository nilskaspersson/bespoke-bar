"use client";

import dynamic from "next/dynamic";

export const RecipeCardModal = dynamic(
	() => import(".").then((m) => m.RecipeCardModal),
	{ ssr: false },
);
