import { z } from "zod";

import { COCKTAIL_STYLES } from "./cocktailStyles";

export const cocktailStyleSchema = z.enum(COCKTAIL_STYLES);
