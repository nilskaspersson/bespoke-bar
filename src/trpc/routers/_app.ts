import { router } from "@/trpc";
import { billingRouter } from "./billing";
import { favoriteRouter } from "./favorite";
import { featuredRouter } from "./featured";
import { ingredientRouter } from "./ingredient";
import { listEntryRouter } from "./listEntry";
import { organisationRouter } from "./organisation";
import { recipeRouter } from "./recipe";
import { recipeListRouter } from "./recipeList";
import { tagRouter } from "./tag";

export const appRouter = router({
	billing: billingRouter,
	ingredient: ingredientRouter,
	recipe: recipeRouter,
	favorite: favoriteRouter,
	recipeList: recipeListRouter,
	listEntry: listEntryRouter,
	featured: featuredRouter,
	organisation: organisationRouter,
	tag: tagRouter,
});

export type AppRouter = typeof appRouter;
