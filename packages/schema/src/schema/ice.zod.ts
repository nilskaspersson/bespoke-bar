import { z } from "zod";

import { ICE_TYPES } from "./ice";

export const iceSchema = z.enum(ICE_TYPES);
