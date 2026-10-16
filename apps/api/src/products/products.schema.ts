import { z } from "zod";
import { optionalText } from "../common/schemas";

export const createProductSchema = z.object({
	name: z.string().trim().min(1).max(200),
	description: optionalText(z.string().trim().max(2000)),
	// Stored as INTEGER cents.
	price: z.number().int().nonnegative(),
	sku: z.string().trim().min(1).max(64),
	category: z.string().trim().min(1).max(100),
	brand: optionalText(z.string().trim().max(100)),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
