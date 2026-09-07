import { z } from "zod";

import { SYSTEM_CATEGORIES } from "./categories";

export const systemCategorySchema = z.enum(SYSTEM_CATEGORIES);
