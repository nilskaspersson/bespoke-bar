import { router } from "@/server/trpc";
import { favoriteRouter } from "./favorite";
import { featuredRouter } from "./featured";
import { ingredientRouter } from "./ingredient";
import { listEntryRouter } from "./listEntry";
import { organisationRouter } from "./organisation";
import { recipeRouter } from "./recipe";
import { recipeListRouter } from "./recipeList";

export const appRouter = router({
	ingredient: ingredientRouter,
	recipe: recipeRouter,
	favorite: favoriteRouter,
	recipeList: recipeListRouter,
	listEntry: listEntryRouter,
	featured: featuredRouter,
	organisation: organisationRouter,
});

export type AppRouter = typeof appRouter;
