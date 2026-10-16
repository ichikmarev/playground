import { z } from "zod";

export const createUserSchema = z.object({
	name: z.string().trim().min(1).max(100),
	email: z.string().trim().toLowerCase().pipe(z.email()),
	phone: z
		.string()
		.trim()
		.regex(/^\+?[0-9][0-9 ()-]{5,19}$/, "Invalid phone number")
		.optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
