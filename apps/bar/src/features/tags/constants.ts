import { insertTagSchema } from "@bespoke/schema/schema/tags";

export const MAX_TAGS_PER_ORG = 100;
export const MAX_TAGS_PER_RECIPE = 20;
export const TAG_NAME_MAX_LENGTH = insertTagSchema.shape.name.maxLength ?? 50;
