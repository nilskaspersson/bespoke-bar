import type { Recipe, RecipeTagWithTag } from "@bespoke/schema/schema/recipes";

type Update = { recipeId: Recipe["id"]; tags: RecipeTagWithTag[] };
type OnUpdateCallback = (update: Update) => void;

const onUpdateListeners = new Set<OnUpdateCallback>();

export const recipeTagsEditorStore = {
	emitUpdate: (update: Update) => {
		for (const listener of onUpdateListeners) {
			listener(update);
		}
	},
	onUpdate: (callback: OnUpdateCallback) => {
		onUpdateListeners.add(callback);
		return () => {
			onUpdateListeners.delete(callback);
		};
	},
};
