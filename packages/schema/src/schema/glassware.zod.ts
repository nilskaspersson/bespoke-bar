import { z } from "zod";

import { GLASSWARES } from "./glassware";

export const glasswareSchema = z.enum(GLASSWARES);
