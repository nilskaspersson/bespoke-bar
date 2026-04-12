"use client";

import dynamic from "next/dynamic";
import type { ComponentProps, Ref } from "react";
import type { RecipeEditorHandle } from "./RecipeEditor";
import { RecipeEditorSkeleton } from "./RecipeEditorSkeleton";

const LazyRecipeEditor = dynamic(
	() =>
		import("./RecipeEditor").then((mod) => ({
			default: mod.RecipeEditor,
		})),
	{ ssr: false, loading: () => <RecipeEditorSkeleton /> },
);

export type { RecipeEditorHandle } from "./RecipeEditor";
export { RecipeEditorSkeleton };

export function RecipeEditor({
	ref,
	...props
}: ComponentProps<typeof LazyRecipeEditor> & {
	ref?: Ref<RecipeEditorHandle>;
}) {
	return <LazyRecipeEditor {...props} ref={ref} />;
}
