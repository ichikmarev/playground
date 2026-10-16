import { z } from "zod";

export const createProductSchema = z.object({
	name: z.string().trim().min(1).max(200),
	description: z.string().trim().max(2000).optional(),
	// Stored as INTEGER cents.
	price: z.number().int().nonnegative(),
	sku: z.string().trim().min(1).max(64),
	category: z.string().trim().min(1).max(100),
	brand: z.string().trim().min(1).max(100).optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
