import { z } from "zod";

import { MEASUREMENT_TYPES, UNITS } from "./units";

export const unitSchema = z.enum(UNITS);

export const measurementSchema = z.enum(MEASUREMENT_TYPES);
