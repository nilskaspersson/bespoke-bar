import { z } from "zod";

import { PREPARATION_METHODS } from "./preparationMethods";

export const preparationMethodSchema = z.enum(PREPARATION_METHODS);
