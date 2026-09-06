"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { RecipeEditorSkeleton } from "./RecipeEditorSkeleton";

const LazyRecipeEditor = dynamic(
	() =>
		import("./RecipeEditor").then((mod) => ({
			default: mod.RecipeEditor,
		})),
	{ ssr: false, loading: () => <RecipeEditorSkeleton /> },
);

export function RecipeEditor(props: ComponentProps<typeof LazyRecipeEditor>) {
	return <LazyRecipeEditor {...props} />;
}
