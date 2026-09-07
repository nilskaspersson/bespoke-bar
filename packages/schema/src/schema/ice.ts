export const ICE_TYPES = ["none", "cubed", "crushed"] as const;

export type Ice = (typeof ICE_TYPES)[number];
