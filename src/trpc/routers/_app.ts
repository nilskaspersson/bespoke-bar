import { router } from "@/trpc";
import { billingRouter } from "./billing";
import { favoriteRouter } from "./favorite";
import { featuredRouter } from "./featured";
import { ingredientRouter } from "./ingredient";
import { menuRouter } from "./menu";
import { menuEntryRouter } from "./menuEntry";
import { organisationRouter } from "./organisation";
import { recipeRouter } from "./recipe";
import { tagRouter } from "./tag";

export const appRouter = router({
	billing: billingRouter,
	ingredient: ingredientRouter,
	recipe: recipeRouter,
	favorite: favoriteRouter,
	menu: menuRouter,
	menuEntry: menuEntryRouter,
	featured: featuredRouter,
	organisation: organisationRouter,
	tag: tagRouter,
});

export type AppRouter = typeof appRouter;
