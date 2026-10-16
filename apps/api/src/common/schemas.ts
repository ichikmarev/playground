import { z } from "zod";

/**
 * Optional text field: accepts omitted, null, or blank ("", "   ") as absent,
 * so clients can round-trip records returned by GET (nullable columns).
 */
export const optionalText = (schema: z.ZodString) =>
	z.preprocess(
		(value) =>
			typeof value === "string" && value.trim() === "" ? undefined : value,
		schema.nullish(),
	);
